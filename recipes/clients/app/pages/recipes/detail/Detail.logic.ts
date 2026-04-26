import type { RecipeVersion } from "@sderickson/recipes-spec";
import {
  assertFilesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
} from "../../../components/recipe-detail/recipeDetailLogic.ts";

export {
  assertFilesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
};

/**
 * Whether the current user can see the version history section (admin only).
 * @deprecated Use role-based checks for collection-scoped pages.
 */
export function canShowVersionHistory(_profile?: { isAdmin?: boolean }): boolean {
  return false;
}

/**
 * Whether the user can edit/delete in this collection (owner or editor).
 * Viewers see read-only; edit/delete UI is hidden.
 */
export function canEditInCollection(role: string | undefined): boolean {
  return role === "owner" || role === "editor";
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
 * Returns the version with the given id, or undefined if not found.
 */
export function getVersionById(
  versions: RecipeVersion[],
  id: string,
): RecipeVersion | undefined {
  return versions.find((v) => v.id === id);
}
