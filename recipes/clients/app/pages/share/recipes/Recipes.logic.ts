import { TanstackError } from "@saflib/sdk";

/**
 * Asserts that the public shared-recipe payload is loaded.
 * AsyncPage gates rendering until the query succeeds; this keeps the page
 * typed for the happy path.
 */
export function assertSharedRecipeLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load shared recipe");
  }
}

/**
 * Whether a loader/query error should show the shared-recipe not-found UI.
 * Real API returns 404; MSW fakes may yield "No data returned".
 */
export function isSharedRecipeNotFound(error: unknown): boolean {
  if (!(error instanceof TanstackError)) return false;
  return error.status === 404 || error.code === "No data returned";
}
