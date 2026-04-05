import { test as base, expect } from "@playwright/test";
import { getUniqueEmail } from "@saflib/playwright";
// TODO: Import the product fixture from the common package
// Example: import { productNameFixture } from "product-name-clients-common/fixtures";

// TODO: Import any page fixtures needed for this test, usually from the same package

// Declare the RegisterFixtures type with one property for each fixture
type RegisterFixtures = {
  // TODO: Add fixture properties here
  // Example:
  // productName: productNameFixture;
  // somePage: SomePageFixture;
};

// Extend base test with fixture definitions that instantiate the classes
const test = base.extend<RegisterFixtures>({
  // TODO: Add fixture definitions here
  // Example:
  // productName: productNameFixture,
  // somePage: somePageFixture,
});

test("register", async ({ page }) => {
  const uniqueEmail = getUniqueEmail();

  await page.goto("http://docker.localhost/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "E-Mail" }).click();
  await page.getByRole("textbox", { name: "E-Mail" }).fill(uniqueEmail);
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.locator("#kratos-login-2").click();
  await page.locator("#kratos-login-2").fill("packtofu");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirm your email" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Continue to app" }).click();
  await expect(page.getByRole("heading", { name: "App Home" })).toBeVisible();
});
