/**
 * Asserts that recipe detail data is loaded. The Async component only renders the page
 * when loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertRecipeLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipe");
  }
}

/**
 * Asserts that profile data is loaded.
 */
export function assertProfileLoaded(profile: unknown): asserts profile {
  if (!profile) {
    throw new Error("Failed to load profile");
  }
}

/**
 * Asserts that versions list data is loaded.
 */
export function assertVersionsLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load versions");
  }
}

/**
 * Whether the current user can see the version history section (admin only).
 */
export function canShowVersionHistory(profile: { isAdmin?: boolean }): boolean {
  return profile.isAdmin === true;
}

/**
 * Formats an ISO date string for display in the version history (e.g. "Feb 23, 2026").
 */
export function formatVersionDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}
