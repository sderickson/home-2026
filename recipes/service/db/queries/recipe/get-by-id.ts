import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";

export type GetByIdRecipeError = RecipeNotFoundError;

export type GetByIdRecipeResult = {
  recipe: typeof recipe.$inferSelect;
  latestVersion: typeof recipeVersion.$inferSelect;
};

export const getByIdRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<GetByIdRecipeResult, GetByIdRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select()
      .from(recipe)
      .innerJoin(
        recipeVersion,
        and(
          eq(recipeVersion.recipeId, recipe.id),
          eq(recipeVersion.isLatest, true),
        ),
      )
      .where(eq(recipe.id, id))
      .limit(1);

    if (rows.length === 0) {
      return {
        error: new RecipeNotFoundError(`Recipe with id '${id}' not found`),
      };
    }

    const row = rows[0];
    return {
      result: {
        recipe: row.recipe,
        latestVersion: row.recipe_version,
      },
    };
  },
);
