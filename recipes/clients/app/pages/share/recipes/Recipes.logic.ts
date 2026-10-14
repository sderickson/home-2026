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
