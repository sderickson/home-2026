import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq, inArray } from "drizzle-orm";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";

export type ListRecipeNoteFilesByRecipeIdError = never;

export interface ListRecipeNoteFilesByRecipeIdParams {
  recipeId: string;
}

export const listRecipeNoteFilesByRecipeId = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListRecipeNoteFilesByRecipeIdParams,
  ): Promise<
    ReturnsError<
      (typeof recipeNoteFile.$inferSelect)[],
      ListRecipeNoteFilesByRecipeIdError
    >
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const noteRows = await db
      .select({ id: recipeNote.id })
      .from(recipeNote)
      .where(eq(recipeNote.recipeId, params.recipeId));

    if (noteRows.length === 0) {
      return { result: [] };
    }

    const noteIds = noteRows.map((r) => r.id);
    const result = await db
      .select()
      .from(recipeNoteFile)
      .where(inArray(recipeNoteFile.recipe_note_id, noteIds));

    return { result };
  },
);
