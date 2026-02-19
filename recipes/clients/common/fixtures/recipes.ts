import type { Page } from "@playwright/test";
import { SafAppFixture } from "@saflib/vue/fixtures";

/**
 * Unified Recipes fixture that extends SafAppFixture.
 * This is the main fixture to use in Recipes E2E tests.
 */
export class RecipesFixture extends SafAppFixture {
  constructor(page: Page) {
    super(page);
  }
}

/**
 * Playwright fixture function for RecipesFixture that automatically sets up:
 * - Clean screenshots (via SafAppFixture)
 * - Tight Android viewport (via SafAppFixture)
 */
export const recipesFixture = async (
  { page }: { page: Page },
  use: (fixture: RecipesFixture) => Promise<void>,
) => {
  const fixture = new RecipesFixture(page);
  await fixture.cleanScreenshots();
  await fixture.useTightAndroidViewport();
  await use(fixture);
};

