/**
 * Asserts that recipe detail data is loaded. The Async component only renders the page
 * when loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertRecipeLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipe");
  }
}
