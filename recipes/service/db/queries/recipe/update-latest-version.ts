import { recipesDbManager } from "../../instances.ts";
import { RecipeVersionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import { recipeVersion } from "../../schemas/recipe.ts";
import type { RecipeVersionContent } from "../../schemas/recipe.ts";

export type UpdateLatestVersionRecipeError = RecipeVersionNotFoundError;

export type UpdateLatestVersionRecipeParams = {
  recipeId: string;
  content: RecipeVersionContent;
};

export const updateLatestVersionRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    params: UpdateLatestVersionRecipeParams,
  ): Promise<
    ReturnsError<typeof recipeVersion.$inferSelect, UpdateLatestVersionRecipeError>
  > => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .update(recipeVersion)
      .set({ content: params.content })
      .where(
        and(
          eq(recipeVersion.recipeId, params.recipeId),
          eq(recipeVersion.isLatest, true),
        ),
      )
      .returning();

    if (result.length === 0) {
      return {
        error: new RecipeVersionNotFoundError(
          `Latest version not found for recipe '${params.recipeId}'`,
        ),
      };
    }

    return { result: result[0] };
  },
);
