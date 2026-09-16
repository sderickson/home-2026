/**
 * Playwright specs assert HTTP/browser behavior for the recipes API + SPAs.
 * Keep threat-model.md in sync when surface grows.
 */
import "./test/playwright-env.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSecurityPlaywrightConfig } from "@saflib/security/playwright/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default createSecurityPlaywrightConfig({
  testDir: path.join(dirname, "test"),
});
