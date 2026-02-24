import { recipesDbManager } from "../../instances.ts";
import { RecipeFileNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipeFile } from "../../schemas/recipe-file.ts";

export type DeleteRecipeFileError = RecipeFileNotFoundError;

export const deleteRecipeFile = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<
    ReturnsError<typeof recipeFile.$inferSelect, DeleteRecipeFileError>
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const result = await db
      .delete(recipeFile)
      .where(eq(recipeFile.id, id))
      .returning();

    if (result.length === 0) {
      return {
        error: new RecipeFileNotFoundError(
          `Recipe file with id '${id}' not found`,
        ),
      };
    }

    return { result: result[0] };
  },
);
