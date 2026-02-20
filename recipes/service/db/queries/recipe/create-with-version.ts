import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import type { RecipeVersionContent } from "../../schemas/recipe.ts";

export type CreateWithVersionRecipeParams = Omit<
  typeof recipe.$inferInsert,
  "id" | "createdAt" | "updatedAt"
> & {
  versionContent: RecipeVersionContent;
};

export type CreateWithVersionRecipeResult = {
  recipe: typeof recipe.$inferSelect;
  version: typeof recipeVersion.$inferSelect;
};

export type CreateWithVersionRecipeError = never;

export const createWithVersionRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    params: CreateWithVersionRecipeParams,
  ): Promise<ReturnsError<CreateWithVersionRecipeResult, CreateWithVersionRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;

    const { versionContent, ...recipeFields } = params;
    const now = new Date();

    const result = await db.transaction(async (tx) => {
      const [insertedRecipe] = await tx
        .insert(recipe)
        .values({
          ...recipeFields,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const [insertedVersion] = await tx
        .insert(recipeVersion)
        .values({
          recipeId: insertedRecipe.id,
          content: versionContent,
          isLatest: true,
          createdBy: params.createdBy,
          createdAt: now,
        })
        .returning();

      return { recipe: insertedRecipe, version: insertedVersion };
    });

    return { result };
  },
);
