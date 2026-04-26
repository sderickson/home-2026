import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeFile } from "../../schemas/recipe-file.ts";

export type DeleteRecipeError = RecipeNotFoundError;

export const deleteRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<typeof recipe.$inferSelect, DeleteRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;

    // Check recipe exists before deleting dependents
    const recipeRows = await db.select().from(recipe).where(eq(recipe.id, id)).limit(1);
    if (recipeRows.length === 0) {
      return {
        error: new RecipeNotFoundError(`Recipe with id '${id}' not found`),
      };
    }

    // Delete in FK order: recipe files → versions → recipe
    await db.delete(recipeFile).where(eq(recipeFile.recipe_id, id));
    await db.delete(recipeVersion).where(eq(recipeVersion.recipeId, id));

    const result = await db.delete(recipe).where(eq(recipe.id, id)).returning();
    return {
      result: result[0]!,
    };
  },
);
