import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import type { RecipeVersionContent } from "../../schemas/recipe.ts";

export type CreateVersionRecipeParams = {
  recipeId: string;
  content: RecipeVersionContent;
  createdBy: string;
};

export type CreateVersionRecipeError = RecipeNotFoundError;

export const createVersionRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    params: CreateVersionRecipeParams,
  ): Promise<
    ReturnsError<typeof recipeVersion.$inferSelect, CreateVersionRecipeError>
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const existingRecipe = await db
      .select()
      .from(recipe)
      .where(eq(recipe.id, params.recipeId))
      .limit(1);

    if (existingRecipe.length === 0) {
      return {
        error: new RecipeNotFoundError(
          `Recipe with id '${params.recipeId}' not found`,
        ),
      };
    }

    const now = new Date();

    const [inserted] = db.transaction((tx) => {
      tx.update(recipeVersion)
        .set({ isLatest: false })
        .where(eq(recipeVersion.recipeId, params.recipeId))
        .run();

      return tx
        .insert(recipeVersion)
        .values({
          recipeId: params.recipeId,
          content: params.content,
          isLatest: true,
          createdBy: params.createdBy,
          createdAt: now,
        })
        .returning()
        .all();
    });

    return { result: inserted };
  },
);
