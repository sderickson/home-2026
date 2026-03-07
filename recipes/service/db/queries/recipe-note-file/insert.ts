import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";

export type InsertRecipeNoteFileParams = {
  recipeId: string;
} & Omit<
  typeof recipeNoteFile.$inferInsert,
  "id" | "created_at" | "updated_at"
>;

export type InsertRecipeNoteFileError = RecipeNoteNotFoundError;

export const insertRecipeNoteFile = queryWrapper(
  async (
    dbKey: DbKey,
    params: InsertRecipeNoteFileParams,
  ): Promise<
    ReturnsError<
      typeof recipeNoteFile.$inferSelect,
      InsertRecipeNoteFileError
    >
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const noteRows = await db
      .select()
      .from(recipeNote)
      .where(
        and(
          eq(recipeNote.id, params.recipe_note_id),
          eq(recipeNote.recipeId, params.recipeId),
        ),
      )
      .limit(1);
    if (noteRows.length === 0) {
      return {
        error: new RecipeNoteNotFoundError(
          `Recipe note with id '${params.recipe_note_id}' not found`,
        ),
      };
    }

    const { recipeId: _recipeId, ...insertValues } = params;
    const [inserted] = await db
      .insert(recipeNoteFile)
      .values(insertValues)
      .returning();

    return { result: inserted };
  },
);
