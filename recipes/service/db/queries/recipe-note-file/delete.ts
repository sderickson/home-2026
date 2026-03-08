import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteFileNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";

export type DeleteRecipeNoteFileError = RecipeNoteFileNotFoundError;

export const deleteRecipeNoteFile = queryWrapper(
  async (
    dbKey: DbKey,
    fileId: string,
  ): Promise<
    ReturnsError<
      typeof recipeNoteFile.$inferSelect,
      DeleteRecipeNoteFileError
    >
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const result = await db
      .delete(recipeNoteFile)
      .where(eq(recipeNoteFile.id, fileId))
      .returning();

    if (result.length === 0) {
      return {
        error: new RecipeNoteFileNotFoundError(
          `Recipe note file with id '${fileId}' not found`,
        ),
      };
    }

    return { result: result[0] };
  },
);
