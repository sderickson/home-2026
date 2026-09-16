import { expect, test as base } from "@playwright/test";
import {
  loginPageFixture,
  registrationPageFixture,
  verifyWallPageFixture,
  type LoginPageFixture,
  type RegistrationPageFixture,
  type VerifyWallPageFixture,
} from "@saflib/ory-kratos-spa/fixtures";
import {
  evilOrigin,
  getCsrfToken,
  recipesApiOrigin,
} from "../fixtures/http-helpers.ts";
import {
  expectCsrfFailure,
  sessionAsRegisteredUser,
} from "../fixtures/kratos-session.ts";

type CsrfFixtures = {
  loginPage: LoginPageFixture;
  registrationPage: RegistrationPageFixture;
  verifyWallPage: VerifyWallPageFixture;
};

const test = base.extend<CsrfFixtures>({
  loginPage: loginPageFixture,
  registrationPage: registrationPageFixture,
  verifyWallPage: verifyWallPageFixture,
});

/**
 * CSRF probes use POST /recipes (authenticated, CSRF-protected).
 * CSRF middleware runs before email-verification auth checks.
 */
test.describe("CSRF (double-submit)", () => {
  test("POST /recipes without CSRF header returns 403", async ({
    page,
    loginPage,
    registrationPage,
    verifyWallPage,
  }) => {
    await sessionAsRegisteredUser(
      page,
      registrationPage,
      verifyWallPage,
      loginPage,
    );

    const res = await page.request.post(`${recipesApiOrigin()}/recipes`, {
      data: {
        collectionId: "csrf-probe",
        title: "csrf probe",
        subtitle: "probe",
      },
      headers: { "Content-Type": "application/json" },
    });
    await expectCsrfFailure(res);
  });

  test("POST /recipes with mismatched CSRF token returns 403", async ({
    page,
    loginPage,
    registrationPage,
    verifyWallPage,
  }) => {
    await sessionAsRegisteredUser(
      page,
      registrationPage,
      verifyWallPage,
      loginPage,
    );

    const origin = recipesApiOrigin();
    // /health is public but still issues `_csrf_token` via global middleware.
    await getCsrfToken(page, origin, { issuerPath: "/health" });
    const res = await page.request.post(`${origin}/recipes`, {
      data: {
        collectionId: "csrf-probe",
        title: "bad token",
        subtitle: "probe",
      },
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "definitely-not-the-cookie-value",
      },
    });
    await expectCsrfFailure(res);
  });

  test("POST /recipes with valid CSRF is not a CSRF failure", async ({
    page,
    loginPage,
    registrationPage,
    verifyWallPage,
  }) => {
    await sessionAsRegisteredUser(
      page,
      registrationPage,
      verifyWallPage,
      loginPage,
    );

    const origin = recipesApiOrigin();
    const csrf = await getCsrfToken(page, origin, { issuerPath: "/health" });
    const res = await page.request.post(`${origin}/recipes`, {
      data: {
        collectionId: "csrf-probe",
        title: `csrf ok ${Date.now()}`,
        subtitle: "probe",
      },
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf,
      },
    });
    // Likely email-verification / membership 403 or validation 400 — not CSRF.
    if (res.status() === 403) {
      const body = await res.json();
      expect(String(body.message ?? "")).not.toContain("CSRF");
    } else {
      expect([200, 201, 400, 404]).toContain(res.status());
    }
  });

  test("POST /csp-violations is no-auth and does not require CSRF token", async ({
    request,
  }) => {
    const res = await request.post(`${recipesApiOrigin()}/csp-violations`, {
      data: { "csp-report": { "document-uri": "http://csrf-probe/" } },
      headers: { "Content-Type": "application/csp-report" },
    });
    expect(res.status()).toBe(204);
  });

  test("cross-site page cannot read authenticated recipes list body", async ({
    page,
    loginPage,
    registrationPage,
    verifyWallPage,
  }) => {
    await sessionAsRegisteredUser(
      page,
      registrationPage,
      verifyWallPage,
      loginPage,
    );

    await page.goto(`${evilOrigin()}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () =>
        document.documentElement.dataset.status !== undefined ||
        document.documentElement.dataset.error !== undefined,
    );

    const status = await page.locator("html").getAttribute("data-status");
    const peek = await page.locator("html").getAttribute("data-peek");
    const err = await page.locator("html").getAttribute("data-error");

    const n = Number(status ?? "0");
    const leakedRecipesJson =
      err === null &&
      n >= 200 &&
      n < 300 &&
      peek !== null &&
      (peek.includes('"recipes"') || peek.includes('"id"'));

    expect(
      leakedRecipesJson,
      "Must not expose recipes JSON to evil origin (fix CORS allowlist if this fails)",
    ).toBe(false);
  });
});
