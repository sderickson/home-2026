import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/utils";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeFile } from "../../schemas/recipe-file.ts";
import { removeRecipeFromMenus } from "./_remove-from-menus.ts";

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

    // Delete in FK order (recipe files → versions → recipe), and take the
    // recipe off any menus so they don't point at it.
    const deleted = db.transaction((tx) => {
      removeRecipeFromMenus(tx, id, recipeRows[0]!.collectionId, new Date());
      tx.delete(recipeFile).where(eq(recipeFile.recipe_id, id)).run();
      tx.delete(recipeVersion).where(eq(recipeVersion.recipeId, id)).run();
      return tx.delete(recipe).where(eq(recipe.id, id)).returning().all();
    });
    return {
      result: deleted[0]!,
    };
  },
);
