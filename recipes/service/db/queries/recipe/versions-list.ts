import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { asc, eq } from "drizzle-orm";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";

export type VersionsListRecipeError = RecipeNotFoundError;

export type VersionsListRecipeResult = {
  versions: (typeof recipeVersion.$inferSelect)[];
};

export const versionsListRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    recipeId: string,
  ): Promise<ReturnsError<VersionsListRecipeResult, VersionsListRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;

    const recipeRows = await db
      .select()
      .from(recipe)
      .where(eq(recipe.id, recipeId))
      .limit(1);

    if (recipeRows.length === 0) {
      return {
        error: new RecipeNotFoundError(`Recipe with id '${recipeId}' not found`),
      };
    }

    const versions = await db
      .select()
      .from(recipeVersion)
      .where(eq(recipeVersion.recipeId, recipeId))
      .orderBy(asc(recipeVersion.createdAt));

    return {
      result: { versions },
    };
  },
);
