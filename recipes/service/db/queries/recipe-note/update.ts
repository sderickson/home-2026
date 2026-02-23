import { recipesDbManager } from "../../instances.ts";
import { RecipeNoteNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import { recipeNote } from "../../schemas/recipe-note.ts";

export type UpdateRecipeNoteParams = Pick<
  typeof recipeNote.$inferSelect,
  "id" | "recipeId" | "body" | "updatedBy"
>;

export type UpdateRecipeNoteResult = typeof recipeNote.$inferSelect;

export type UpdateRecipeNoteError = RecipeNoteNotFoundError;

export const updateRecipeNote = queryWrapper(
  async (
    dbKey: DbKey,
    params: UpdateRecipeNoteParams,
  ): Promise<ReturnsError<UpdateRecipeNoteResult, UpdateRecipeNoteError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    const result = await db
      .update(recipeNote)
      .set({
        body: params.body,
        everEdited: true,
        updatedBy: params.updatedBy,
        updatedAt: now,
      })
      .where(
        and(
          eq(recipeNote.id, params.id),
          eq(recipeNote.recipeId, params.recipeId),
        ),
      )
      .returning();

    if (result.length === 0) {
      return {
        error: new RecipeNoteNotFoundError(
          `Recipe note with id '${params.id}' not found`,
        ),
      };
    }

    return { result: result[0] };
  },
);
