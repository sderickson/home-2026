import type {
  RecipeNoteFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import {
  assertFilesLoaded,
  assertNoteFilesByRecipeLoaded,
  assertNotesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  groupNoteFilesByNoteId,
  notesByVersionIdMap,
  notesForLatestVersion,
} from "../../../components/recipe-detail/recipeDetailLogic.ts";

export {
  assertFilesLoaded,
  assertNoteFilesByRecipeLoaded,
  assertNotesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  groupNoteFilesByNoteId,
  notesByVersionIdMap,
  notesForLatestVersion,
};

/**
 * Whether the current user can see the version history section (admin only).
 * @deprecated Use role-based checks for collection-scoped pages.
 */
export function canShowVersionHistory(profile: { isAdmin?: boolean }): boolean {
  return profile.isAdmin === true;
}

/**
 * Whether the current user can add, edit, or delete notes (admin only).
 * @deprecated Use canEditInCollection for collection-scoped pages.
 */
export function canShowNotesEdit(profile: { isAdmin?: boolean }): boolean {
  return profile.isAdmin === true;
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
 * Formats an ISO date string for note display in chat style (e.g. "Mar 10, 2:30 PM").
 */
export function formatNoteDateTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

/**
 * Builds a map from note id to that note's files, given notes and the
 * parallel array of note-files query results (same order as notes).
 */
export function buildNoteIdToFilesMap(
  notes: Array<{ id: string }>,
  noteFilesResults: Array<{ data?: RecipeNoteFileInfo[] } | undefined>,
): Map<string, RecipeNoteFileInfo[]> {
  const map = new Map<string, RecipeNoteFileInfo[]>();
  for (let i = 0; i < notes.length; i++) {
    map.set(notes[i].id, (noteFilesResults[i]?.data ?? []) as RecipeNoteFileInfo[]);
  }
  return map;
}
