import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipeFile } from "../../schemas/recipe-file.ts";
import { recipe } from "../../schemas/recipe.ts";

export type InsertRecipeFileParams = Omit<
  typeof recipeFile.$inferInsert,
  "id" | "created_at" | "updated_at"
>;

export type InsertRecipeFileError = RecipeNotFoundError;

export const insertRecipeFile = queryWrapper(
  async (
    dbKey: DbKey,
    params: InsertRecipeFileParams,
  ): Promise<
    ReturnsError<typeof recipeFile.$inferSelect, InsertRecipeFileError>
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const recipeRows = await db
      .select()
      .from(recipe)
      .where(eq(recipe.id, params.recipe_id))
      .limit(1);
    if (recipeRows.length === 0) {
      return {
        error: new RecipeNotFoundError(
          `Recipe with id '${params.recipe_id}' not found`,
        ),
      };
    }

    const [inserted] = await db
      .insert(recipeFile)
      .values(params)
      .returning();

    return { result: inserted };
  },
);
