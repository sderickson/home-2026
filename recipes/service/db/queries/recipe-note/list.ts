import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { recipe } from "../../schemas/recipe.ts";

export type ListRecipeNoteError = RecipeNotFoundError;

export interface ListRecipeNoteParams {
  recipeId: string;
}

export const listRecipeNote = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListRecipeNoteParams,
  ): Promise<
    ReturnsError<typeof recipeNote.$inferSelect[], ListRecipeNoteError>
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const recipeRows = await db
      .select()
      .from(recipe)
      .where(eq(recipe.id, params.recipeId))
      .limit(1);
    if (recipeRows.length === 0) {
      return {
        error: new RecipeNotFoundError(
          `Recipe with id '${params.recipeId}' not found`,
        ),
      };
    }

    const result = await db
      .select()
      .from(recipeNote)
      .where(eq(recipeNote.recipeId, params.recipeId));

    return { result };
  },
);
