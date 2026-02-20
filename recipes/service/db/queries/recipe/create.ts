import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/monorepo";

import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { recipe } from "../../schemas/recipe.ts";

export type CreateRecipeParams = Omit<
  typeof recipe.$inferInsert,
  "id" | "createdAt" | "updatedAt"
>;

export type CreateRecipeResult = typeof recipe.$inferSelect;

export type CreateRecipeError = never;

export const createRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    params: CreateRecipeParams,
  ): Promise<ReturnsError<CreateRecipeResult, CreateRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    const [inserted] = await db
      .insert(recipe)
      .values({
        ...params,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return { result: inserted };
  },
);
