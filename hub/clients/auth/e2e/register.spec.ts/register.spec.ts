import { test as base, expect } from "@playwright/test";
import {
  registrationPageFixture,
  verifyWallPageFixture,
  type RegistrationPageFixture,
  type VerifyWallPageFixture,
} from "@saflib/ory-kratos-spa/fixtures";
import { getUniqueEmail } from "@saflib/playwright";

type RegisterFixtures = {
  registrationPage: RegistrationPageFixture;
  verifyWallPage: VerifyWallPageFixture;
};

const test = base.extend<RegisterFixtures>({
  registrationPage: registrationPageFixture,
  verifyWallPage: verifyWallPageFixture,
});

test("register", async ({ page, registrationPage, verifyWallPage }) => {
  const uniqueEmail = getUniqueEmail();

  await page.goto("http://docker.localhost/");
  await page.getByRole("link", { name: "Register" }).click();
  await registrationPage.toBeVisible();
  await registrationPage.completeRegistration(uniqueEmail, "packtofu");
  await verifyWallPage.toBeVisible();
  await verifyWallPage.clickContinueToApp();
  await expect(page.getByRole("heading", { name: "App Home" })).toBeVisible();
});
