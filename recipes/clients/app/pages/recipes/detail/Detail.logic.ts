import type { RecipeNote, RecipeVersion } from "@sderickson/recipes-spec";

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
 * Asserts that notes list data is loaded.
 */
export function assertNotesLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load notes");
  }
}

/**
 * Whether the current user can see the version history section (admin only).
 */
export function canShowVersionHistory(profile: { isAdmin?: boolean }): boolean {
  return profile.isAdmin === true;
}

/**
 * Whether the current user can add, edit, or delete notes (admin only).
 */
export function canShowNotesEdit(profile: { isAdmin?: boolean }): boolean {
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

/**
 * Groups notes by their recipeVersionId. Only notes with a non-null recipeVersionId
 * are included. Used to show "notes for this version" in the version history modal.
 */
export function notesByVersionIdMap(
  notes: RecipeNote[],
): Map<string, RecipeNote[]> {
  const map = new Map<string, RecipeNote[]>();
  for (const n of notes) {
    if (n.recipeVersionId) {
      const arr = map.get(n.recipeVersionId) ?? [];
      arr.push(n);
      map.set(n.recipeVersionId, arr);
    }
  }
  return map;
}

/**
 * Returns the version with the given id, or undefined if not found.
 */
export function getVersionById(
  versions: RecipeVersion[],
  id: string,
): RecipeVersion | undefined {
  return versions.find((v) => v.id === id);
}
