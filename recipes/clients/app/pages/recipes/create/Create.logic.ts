/**
 * Asserts that create page data is loaded. The Async component only renders the page
 * when loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertCreateDataLoaded(profile: unknown): asserts profile {
  if (!profile) {
    throw new Error("Failed to load profile");
  }
}
