import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipeFile } from "../../schemas/recipe-file.ts";
import { recipe } from "../../schemas/recipe.ts";

export type ListRecipeFileError = RecipeNotFoundError;

export interface ListRecipeFileParams {
  recipeId: string;
}

export const listRecipeFile = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListRecipeFileParams,
  ): Promise<
    ReturnsError<typeof recipeFile.$inferSelect[], ListRecipeFileError>
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
      .from(recipeFile)
      .where(eq(recipeFile.recipe_id, params.recipeId));

    return { result };
  },
);
