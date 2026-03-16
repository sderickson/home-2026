import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipe } from "../../schemas/recipe.ts";

export type UpdateMetadataRecipeError = RecipeNotFoundError;

export type UpdateMetadataRecipeParams = Pick<
  typeof recipe.$inferSelect,
  "id" | "title" | "subtitle" | "description" | "updatedBy"
>;

export const updateMetadataRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    params: UpdateMetadataRecipeParams,
  ): Promise<ReturnsError<typeof recipe.$inferSelect, UpdateMetadataRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .update(recipe)
      .set({
        title: params.title,
        subtitle: params.subtitle,
        description: params.description,
        updatedBy: params.updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(recipe.id, params.id))
      .returning();

    if (result.length === 0) {
      return {
        error: new RecipeNotFoundError(`Recipe with id '${params.id}' not found`),
      };
    }

    return { result: result[0] };
  },
);
