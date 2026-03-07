import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";

export type ListRecipeNoteFileError = RecipeNoteNotFoundError;

export interface ListRecipeNoteFileParams {
  recipeId: string;
  noteId: string;
}

export const listRecipeNoteFile = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListRecipeNoteFileParams,
  ): Promise<
    ReturnsError<
      (typeof recipeNoteFile.$inferSelect)[],
      ListRecipeNoteFileError
    >
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const noteRows = await db
      .select()
      .from(recipeNote)
      .where(
        and(
          eq(recipeNote.id, params.noteId),
          eq(recipeNote.recipeId, params.recipeId),
        ),
      )
      .limit(1);
    if (noteRows.length === 0) {
      return {
        error: new RecipeNoteNotFoundError(
          `Recipe note with id '${params.noteId}' not found`,
        ),
      };
    }

    const result = await db
      .select()
      .from(recipeNoteFile)
      .where(eq(recipeNoteFile.recipe_note_id, params.noteId));

    return { result };
  },
);
