import { test as base, expect } from "@playwright/test";
import {
  loginPageFixture,
  registrationPageFixture,
  type LoginPageFixture,
  type RegistrationPageFixture,
} from "@saflib/ory-kratos-spa/fixtures";
import { getUniqueEmail } from "@saflib/playwright";

type RegisterFixtures = {
  loginPage: LoginPageFixture;
  registrationPage: RegistrationPageFixture;
};

const test = base.extend<RegisterFixtures>({
  loginPage: loginPageFixture,
  registrationPage: registrationPageFixture,
});

test("register, logout, and login", async ({
  page,
  loginPage,
  registrationPage,
}) => {
  const uniqueEmail = getUniqueEmail();

  await page.goto("http://docker.localhost/");
  await page.getByRole("link", { name: "Register" }).click();
  await registrationPage.toBeVisible();
  await registrationPage.completeRegistration(uniqueEmail, "packtofu");
  // Registration returns a session and navigates to the app (verify-wall is not
  // mounted on the hub auth SPA; settings/verify live on account).
  await expect(page.getByRole("heading", { name: "App Home" })).toBeVisible();
  await page.getByRole("banner").getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Log in" }).click();
  await loginPage.toBeVisible();
  await loginPage.signInWithPassword(uniqueEmail, "packtofu");
  await expect(page.getByRole("heading", { name: "App Home" })).toBeVisible();
});
