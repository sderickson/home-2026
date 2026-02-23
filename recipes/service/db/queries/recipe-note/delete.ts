import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipeNote } from "../../schemas/recipe-note.ts";

export type DeleteRecipeNoteError = RecipeNoteNotFoundError;

export const deleteRecipeNote = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<typeof recipeNote.$inferSelect, DeleteRecipeNoteError>> => {
    const db = recipesDbManager.get(dbKey)!;

    const result = await db
      .delete(recipeNote)
      .where(eq(recipeNote.id, id))
      .returning();

    if (result.length === 0) {
      return {
        error: new RecipeNoteNotFoundError(
          `Recipe note with id '${id}' not found`,
        ),
      };
    }

    return { result: result[0] };
  },
);
