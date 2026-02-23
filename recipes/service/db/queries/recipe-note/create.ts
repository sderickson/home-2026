import { recipesDbManager } from "../../instances.ts";
import {
  RecipeNotFoundError,
  RecipeVersionNotFoundError,
} from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";

export type CreateRecipeNoteParams = Omit<
  typeof recipeNote.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export type CreateRecipeNoteResult = typeof recipeNote.$inferSelect;

export type CreateRecipeNoteError =
  | RecipeNotFoundError
  | RecipeVersionNotFoundError;

export const createRecipeNote = queryWrapper(
  async (
    dbKey: DbKey,
    params: CreateRecipeNoteParams,
  ): Promise<ReturnsError<CreateRecipeNoteResult, CreateRecipeNoteError>> => {
    const db = recipesDbManager.get(dbKey)!;

    const recipeRows = await db
      .select()
      .from(recipe)
      .where(eq(recipe.id, params.recipeId))
      .limit(1);
    if (recipeRows.length === 0) {
      return {
        error: new RecipeNotFoundError(
          `Recipe with id '${params.recipeId}' not found`,
        ),
      };
    }

    if (params.recipeVersionId != null) {
      const versionRows = await db
        .select()
        .from(recipeVersion)
        .where(
          and(
            eq(recipeVersion.id, params.recipeVersionId),
            eq(recipeVersion.recipeId, params.recipeId),
          ),
        )
        .limit(1);
      if (versionRows.length === 0) {
        return {
          error: new RecipeVersionNotFoundError(
            `Recipe version with id '${params.recipeVersionId}' not found`,
          ),
        };
      }
    }

    const now = new Date();
    const [inserted] = await db
      .insert(recipeNote)
      .values({
        ...params,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return { result: inserted };
  },
);
