import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import type { RecipeVersionEntity } from "../../schemas/recipe.ts";

export type GetByIdRecipeError = RecipeNotFoundError;

export type GetByIdRecipeResult = {
  recipe: typeof recipe.$inferSelect;
  latestVersion: typeof recipeVersion.$inferSelect;
};

/** Placeholder version when recipe exists but has no versions (e.g. partial state after a failed delete). */
function placeholderLatestVersion(recipeRow: typeof recipe.$inferSelect): RecipeVersionEntity {
  return {
    id: "__partial__",
    recipeId: recipeRow.id,
    content: { ingredients: [], instructionsMarkdown: "" },
    isLatest: true,
    createdBy: recipeRow.createdBy,
    createdAt: recipeRow.createdAt,
  };
}

export const getByIdRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<GetByIdRecipeResult, GetByIdRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;

    const recipeRows = await db.select().from(recipe).where(eq(recipe.id, id)).limit(1);
    if (recipeRows.length === 0) {
      return {
        error: new RecipeNotFoundError(`Recipe with id '${id}' not found`),
      };
    }

    const recipeRow = recipeRows[0];
    const versionRows = await db
      .select()
      .from(recipeVersion)
      .where(
        and(
          eq(recipeVersion.recipeId, id),
          eq(recipeVersion.isLatest, true),
        ),
      )
      .limit(1);

    const latestVersion =
      versionRows.length > 0 ? versionRows[0] : placeholderLatestVersion(recipeRow);

    return {
      result: {
        recipe: recipeRow,
        latestVersion,
      },
    };
  },
);
