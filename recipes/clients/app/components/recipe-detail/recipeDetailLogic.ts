import type {
  RecipeNote,
  RecipeNoteFileInfo,
} from "@sderickson/recipes-spec";

/**
 * Asserts that recipe detail data is loaded. Used by both standalone recipe detail
 * and menu-context recipe detail pages.
 */
export function assertRecipeLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipe");
  }
}

export function assertProfileLoaded(profile: unknown): asserts profile {
  if (!profile) {
    throw new Error("Failed to load profile");
  }
}

export function assertVersionsLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load versions");
  }
}

export function assertNotesLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load notes");
  }
}

export function assertFilesLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipe files");
  }
}

export function assertNoteFilesByRecipeLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load note files");
  }
}

/**
 * Groups notes by their recipeVersionId. Used by RecipeDetailContent for version history and notes.
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
 * Returns notes that belong to the given version (recipeVersionId match), newest first.
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
 * Groups a flat list of note files by recipeNoteId. Used by RecipeDetailContent for note cards.
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
