import { expect, type APIRequestContext, type Page } from "@playwright/test";
import type {
  LoginPageFixture,
  RegistrationPageFixture,
  VerifyWallPageFixture,
} from "@saflib/ory-kratos-spa/fixtures";
import { getCsrfToken, recipesApiOrigin } from "./http-helpers.ts";
import { TEST_PASSWORD } from "./kratos-session.ts";

export const UNKNOWN_UUID = "00000000-0000-0000-0000-000000000001";

/**
 * First address from `ADMIN_EMAILS` (Playwright process or recipes/dev default).
 * Collection create is admin-only — must match monolith `ADMIN_EMAILS`.
 */
export function recipesAdminEmail(): string {
  const email = (process.env.ADMIN_EMAILS ?? "sderickson@gmail.com")
    .split(",")
    .map((e) => e.trim())
    .find(Boolean);
  if (!email) {
    throw new Error(
      "ADMIN_EMAILS must be set (collection create is admin-only)",
    );
  }
  return email;
}

async function hasApiSessionCookie(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies(recipesApiOrigin());
  return cookies.some(
    (c) =>
      /session/i.test(c.name) && !/csrf|xsrf|continuity/i.test(c.name),
  );
}

async function waitForSessionCookie(page: Page): Promise<void> {
  await expect
    .poll(() => hasApiSessionCookie(page), { timeout: 30_000 })
    .toBe(true);
}

/**
 * Pull the newest Kratos verification URL from the public dev log ring buffer
 * (courier callback logs it; same monolith process as GET /dev/logs).
 */
async function pollVerificationUrlFromDevLogs(
  request: APIRequestContext,
  api: string,
): Promise<string> {
  let found: string | undefined;
  await expect
    .poll(
      async () => {
        const res = await request.get(`${api}/dev/logs?limit=200`);
        if (!res.ok()) return null;
        const body = (await res.json()) as {
          logs?: { message?: string }[];
        };
        for (const entry of [...(body.logs ?? [])].reverse()) {
          const message = entry.message ?? "";
          if (!/verification code email/i.test(message)) continue;
          const match = message.match(/https?:\/\/\S+/);
          if (match) {
            found = match[0].replace(/[.,;)]+$/, "");
            return found;
          }
        }
        return null;
      },
      { timeout: 30_000 },
    )
    .toBeTruthy();
  return found!;
}

async function completeVerificationFromDevLogs(
  page: Page,
  request: APIRequestContext,
): Promise<void> {
  const api = recipesApiOrigin();
  const url = await pollVerificationUrlFromDevLogs(request, api);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const continueBtn = page.getByRole("button", { name: "Continue" });
  const verifyBtn = page.getByRole("button", { name: "Verify" });
  await expect(
    continueBtn
      .or(verifyBtn)
      .or(page.getByRole("heading", { name: "Verify your email" })),
  ).toBeVisible({ timeout: 30_000 });

  if (await continueBtn.isVisible().catch(() => false)) {
    await continueBtn.click();
    const domain = process.env.DOMAIN ?? "app.docker.localhost";
    const escaped = domain.replace(/\./g, "\\.");
    await expect(page).toHaveURL(
      new RegExp(`^https?://app\\.${escaped}(/|\\?|#|$)`),
      { timeout: 60_000 },
    );
    return;
  }

  const code = new URL(page.url()).searchParams.get("code");
  if (code && (await verifyBtn.isVisible().catch(() => false))) {
    await page.getByLabel("Verification code").fill(code);
    await verifyBtn.click();
  }

  await expect
    .poll(async () => (await page.request.get(`${api}/health`)).ok(), {
      timeout: 30_000,
    })
    .toBe(true);
}

/**
 * Ensure a verified admin browser session (collection create is admin-only).
 * Tries password login first; registers + verifies via /dev/logs on miss.
 */
export async function sessionAsVerifiedAdmin(
  page: Page,
  registrationPage: RegistrationPageFixture,
  _verifyWallPage: VerifyWallPageFixture,
  loginPage: LoginPageFixture,
  request: APIRequestContext,
): Promise<string> {
  const email = recipesAdminEmail();
  await page.context().clearCookies();

  await loginPage.gotoLogin();
  await loginPage.toBeVisible();
  await loginPage.signInWithPassword(email, TEST_PASSWORD);

  try {
    await expect
      .poll(() => hasApiSessionCookie(page), { timeout: 8_000 })
      .toBe(true);
    return email;
  } catch {
    // No account yet (or wrong password) — register below.
  }

  await page.context().clearCookies();
  await registrationPage.gotoRegistration();
  await registrationPage.toBeVisible();
  await registrationPage.completeRegistration(email, TEST_PASSWORD);
  await waitForSessionCookie(page);
  await completeVerificationFromDevLogs(page, request);
  return email;
}

export type SharedRecipeSeed = {
  recipeId: string;
  fileId: string;
};

/**
 * Create a collection + recipe + file as a verified admin. Returns ids for
 * unauthenticated share-route probes (use Playwright `request`, not `page.request`).
 */
export async function seedSharedRecipeWithFile(
  page: Page,
  registrationPage: RegistrationPageFixture,
  verifyWallPage: VerifyWallPageFixture,
  loginPage: LoginPageFixture,
  request: APIRequestContext,
): Promise<SharedRecipeSeed> {
  await sessionAsVerifiedAdmin(
    page,
    registrationPage,
    verifyWallPage,
    loginPage,
    request,
  );

  const api = recipesApiOrigin();
  const csrf = await getCsrfToken(page, api, { issuerPath: "/health" });
  const stamp = Date.now();

  const collectionRes = await page.request.post(`${api}/collections`, {
    data: { name: `security-share ${stamp}` },
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
    },
  });
  expect(
    collectionRes.status(),
    `POST /collections: ${await collectionRes.text()}`,
  ).toBe(200);
  const collectionBody = (await collectionRes.json()) as {
    collection: { id: string };
  };
  const collectionId = collectionBody.collection.id;

  const recipeRes = await page.request.post(`${api}/recipes`, {
    data: {
      collectionId,
      title: `share probe ${stamp}`,
      subtitle: "security",
      initialVersion: {
        content: {
          ingredients: [{ name: "Salt", quantity: "1", unit: "pinch" }],
          instructionsMarkdown: "Mix.",
        },
      },
    },
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
    },
  });
  expect(
    recipeRes.status(),
    `POST /recipes: ${await recipeRes.text()}`,
  ).toBe(200);
  const recipeBody = (await recipeRes.json()) as { recipe: { id: string } };
  const recipeId = recipeBody.recipe.id;

  const fileRes = await page.request.post(`${api}/recipes/${recipeId}/files`, {
    multipart: {
      file: {
        name: "share-probe.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("share-probe-bytes"),
      },
    },
    headers: { "X-CSRF-Token": csrf },
  });
  expect(
    fileRes.status(),
    `POST /recipes/:id/files: ${await fileRes.text()}`,
  ).toBe(200);
  const fileBody = (await fileRes.json()) as { file: { id: string } };

  return { recipeId, fileId: fileBody.file.id };
}
