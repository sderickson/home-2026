import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";

export type DeleteRecipeError = RecipeNotFoundError;

export const deleteRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<typeof recipe.$inferSelect, DeleteRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;

    await db.delete(recipeVersion).where(eq(recipeVersion.recipeId, id));

    const result = await db
      .delete(recipe)
      .where(eq(recipe.id, id))
      .returning();

    if (result.length === 0) {
      return {
        error: new RecipeNotFoundError(`Recipe with id '${id}' not found`),
      };
    }

    return {
      result: result[0],
    };
  },
);
