/**
 * Asserts that profile data is loaded. The Async component only renders the page
 * when loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertProfileLoaded(profile: unknown): asserts profile {
  if (!profile) {
    throw new Error("Failed to load profile");
  }
}

/**
 * Asserts that recipes list data is loaded. The Async component only renders the page
 * when loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertRecipesLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipes");
  }
}

/**
 * Whether the current user can see the "Create recipe" action (admin only).
 */
export function canShowCreateRecipe(profile: { isAdmin?: boolean }): boolean {
  return profile.isAdmin === true;
}

/**
 * Normalizes recipes query data to a list (empty array when undefined).
 */
export function getRecipesList<T>(data: T[] | undefined): T[] {
  return data ?? [];
}
