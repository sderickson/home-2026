import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq, inArray } from "drizzle-orm";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";
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

    // Delete in FK order: note files → notes → recipe files → versions → recipe
    const noteIds = await db
      .select({ id: recipeNote.id })
      .from(recipeNote)
      .where(eq(recipeNote.recipeId, id));
    if (noteIds.length > 0) {
      await db
        .delete(recipeNoteFile)
        .where(inArray(recipeNoteFile.recipe_note_id, noteIds.map((n) => n.id)));
    }
    await db.delete(recipeNote).where(eq(recipeNote.recipeId, id));
    await db.delete(recipeFile).where(eq(recipeFile.recipe_id, id));
    await db.delete(recipeVersion).where(eq(recipeVersion.recipeId, id));

    const result = await db.delete(recipe).where(eq(recipe.id, id)).returning();
    return {
      result: result[0]!,
    };
  },
);
