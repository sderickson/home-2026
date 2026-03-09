import type {
  RecipeNote,
  RecipeNoteFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";

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
 * Asserts that recipe files list data is loaded.
 */
export function assertFilesLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipe files");
  }
}

/**
 * Asserts that note files by recipe (single request) data is loaded.
 */
export function assertNoteFilesByRecipeLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load note files");
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

/**
 * Returns notes that belong to the given version (recipeVersionId match),
 * newest first (by createdAt).
 */
export function notesForLatestVersion(
  notes: RecipeNote[],
  currentVersionId: string | undefined,
): RecipeNote[] {
  if (!currentVersionId) return [];
  return [...notes]
    .filter((n) => n.recipeVersionId === currentVersionId)
    .reverse();
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

/**
 * Groups a flat list of note files by recipeNoteId (e.g. from GET /recipes/:id/note-files).
 */
export function groupNoteFilesByNoteId(
  files: RecipeNoteFileInfo[],
): Map<string, RecipeNoteFileInfo[]> {
  const map = new Map<string, RecipeNoteFileInfo[]>();
  for (const f of files) {
    const arr = map.get(f.recipeNoteId) ?? [];
    arr.push(f);
    map.set(f.recipeNoteId, arr);
  }
  return map;
}
