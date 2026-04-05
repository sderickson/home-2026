import { test as base, expect } from "@playwright/test";
import {
  loginPageFixture,
  registrationPageFixture,
  verifyWallPageFixture,
  type LoginPageFixture,
  type RegistrationPageFixture,
  type VerifyWallPageFixture,
} from "@saflib/ory-kratos-spa/fixtures";
import { getUniqueEmail } from "@saflib/playwright";

type RegisterFixtures = {
  loginPage: LoginPageFixture;
  registrationPage: RegistrationPageFixture;
  verifyWallPage: VerifyWallPageFixture;
};

const test = base.extend<RegisterFixtures>({
  loginPage: loginPageFixture,
  registrationPage: registrationPageFixture,
  verifyWallPage: verifyWallPageFixture,
});

test("register, logout, and login", async ({
  page,
  loginPage,
  registrationPage,
  verifyWallPage,
}) => {
  const uniqueEmail = getUniqueEmail();

  await page.goto("http://docker.localhost/");
  await page.getByRole("link", { name: "Register" }).click();
  await registrationPage.toBeVisible();
  await registrationPage.completeRegistration(uniqueEmail, "packtofu");
  await verifyWallPage.toBeVisible();
  await verifyWallPage.clickContinueToApp();
  await expect(page.getByRole("heading", { name: "App Home" })).toBeVisible();
  await page.getByRole("banner").getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Log in" }).click();
  await loginPage.toBeVisible();
  await loginPage.signInWithPassword(uniqueEmail, "packtofu");
  await expect(page.getByRole("heading", { name: "App Home" })).toBeVisible();
});
