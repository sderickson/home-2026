import { expect, test as notebook } from "@playwright/test";
import {
  loginPageFixture,
  type LoginPageFixture,
} from "@saflib/ory-kratos-spa/fixtures";
import { apiOrigin } from "@saflib/security/origins/urls";
import {
  assertCsrfCookie,
  assertSecureSessionCookie,
  findCsrfCookie,
  findSessionCookie,
} from "@saflib/security/http/cookies";

/**
 * HTTPS-only cookie attributes are observable against production.
 * Requires SECURITY_CANARY_KRATOS_EMAIL / SECURITY_CANARY_KRATOS_PASSWORD.
 */
const test = notebook.extend<{ loginPage: LoginPageFixture }>({
  loginPage: loginPageFixture,
});

const email = process.env.SECURITY_CANARY_KRATOS_EMAIL ?? "";
const password = process.env.SECURITY_CANARY_KRATOS_PASSWORD ?? "";

test.describe("secure cookies", { tag: "@canary" }, () => {
  test("Kratos session cookie and CSRF cookie attributes after login", async ({
    page,
    loginPage,
  }) => {
    test.skip(
      !email || !password,
      "Set SECURITY_CANARY_KRATOS_EMAIL and SECURITY_CANARY_KRATOS_PASSWORD for scheduled canary CI.",
    );
    await loginPage.gotoLogin();
    await loginPage.toBeVisible();
    await loginPage.signInWithPassword(email, password);

    const domain = process.env.DOMAIN ?? "notebook.scotterickson.info";
    await expect(page).toHaveURL(
      new RegExp(`account\\.${domain.replace(/\./g, "\\.")}`),
      {
        timeout: 10_000,
      },
    );

    const apiNotebook = apiOrigin();
    await page.goto(`${apiNotebook}/health`, { waitUntil: "domcontentloaded" });

    const cookies = await page.context().cookies(apiNotebook);
    const sessionCookie = findSessionCookie(cookies);
    expect(
      sessionCookie,
      "Expected an Ory/Kratos session cookie",
    ).toBeDefined();
    assertSecureSessionCookie(sessionCookie!);

    const csrf = findCsrfCookie(cookies);
    expect(
      csrf,
      "Expected double-submit CSRF cookie after API response",
    ).toBeDefined();
    assertCsrfCookie(csrf!);
  });
});
