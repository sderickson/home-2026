import type { Page } from "@playwright/test";
import { SafAppFixture } from "@saflib/vue/fixtures";

/**
 * Unified Hub fixture that extends SafAppFixture.
 * This is the main fixture to use in Hub E2E tests.
 */
export class HubFixture extends SafAppFixture {
  constructor(page: Page) {
    super(page);
  }
}

/**
 * Playwright fixture function for HubFixture that automatically sets up:
 * - Clean screenshots (via SafAppFixture)
 * - Tight Android viewport (via SafAppFixture)
 */
export const hubFixture = async (
  { page }: { page: Page },
  use: (fixture: HubFixture) => Promise<void>,
) => {
  const fixture = new HubFixture(page);
  await fixture.cleanScreenshots();
  await fixture.useTightAndroidViewport();
  await use(fixture);
};

