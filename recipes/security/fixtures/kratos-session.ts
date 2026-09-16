import { expect, type Page } from "@playwright/test";
import type {
  LoginPageFixture,
  RegistrationPageFixture,
  VerifyWallPageFixture,
} from "@saflib/ory-kratos-spa/fixtures";
import { getUniqueEmail } from "@saflib/playwright";
import { recipesApiOrigin } from "./http-helpers.ts";

/** Default password for security-suite registrations. */
export const TEST_PASSWORD = "packtofu-security";

/**
 * Register a unique user and wait until a Kratos session cookie is usable.
 * Recipes API also requires email verification for mutating routes; CSRF
 * middleware runs first, so missing-token probes still work without verifying.
 */
export async function registerWithoutVerifying(
  page: Page,
  registrationPage: RegistrationPageFixture,
  _verifyWallPage: VerifyWallPageFixture,
  email?: string,
): Promise<string> {
  const unique = email ?? getUniqueEmail();
  await page.context().clearCookies();
  await registrationPage.gotoRegistration();
  await registrationPage.toBeVisible();
  await registrationPage.completeRegistration(unique, TEST_PASSWORD);

  await expect
    .poll(
      async () => {
        const cookies = await page.context().cookies(recipesApiOrigin());
        return cookies.some(
          (c) =>
            /session/i.test(c.name) &&
            !/csrf|xsrf|continuity/i.test(c.name),
        );
      },
      { timeout: 30_000 },
    )
    .toBe(true);

  return unique;
}

export async function sessionAsRegisteredUser(
  page: Page,
  registrationPage: RegistrationPageFixture,
  verifyWallPage: VerifyWallPageFixture,
  _loginPage: LoginPageFixture,
): Promise<string> {
  return registerWithoutVerifying(page, registrationPage, verifyWallPage);
}

export async function expectCsrfFailure(res: {
  status: () => number;
  json: () => Promise<{ message?: string }>;
}): Promise<void> {
  expect(res.status()).toBe(403);
  const body = await res.json();
  expect(body.message).toContain("CSRF");
}
