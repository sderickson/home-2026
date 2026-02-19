import type { Page } from "@playwright/test";
import { SafAppFixture } from "@saflib/vue/fixtures";

/**
 * Unified Notebook fixture that extends SafAppFixture.
 * This is the main fixture to use in Notebook E2E tests.
 */
export class NotebookFixture extends SafAppFixture {
  constructor(page: Page) {
    super(page);
  }
}

/**
 * Playwright fixture function for NotebookFixture that automatically sets up:
 * - Clean screenshots (via SafAppFixture)
 * - Tight Android viewport (via SafAppFixture)
 */
export const notebookFixture = async (
  { page }: { page: Page },
  use: (fixture: NotebookFixture) => Promise<void>,
) => {
  const fixture = new NotebookFixture(page);
  await fixture.cleanScreenshots();
  await fixture.useTightAndroidViewport();
  await use(fixture);
};

