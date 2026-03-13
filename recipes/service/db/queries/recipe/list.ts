import { recipesDbManager } from "../../instances.ts";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import type { ReturnsError } from "@saflib/monorepo";
import { and, eq } from "drizzle-orm";
import { recipe } from "../../schemas/recipe.ts";

export interface ListRecipesParams {
  /** Id of the collection to list recipes from. Required. */
  collectionId: string;
  /** When true (admin), return all recipes in the collection. When false or omitted, only public recipes. */
  includePrivate?: boolean;
}

export const listRecipes = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListRecipesParams,
  ): Promise<ReturnsError<typeof recipe.$inferSelect[], never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const collectionCondition = eq(recipe.collectionId, params.collectionId);
    const result =
      params.includePrivate === true
        ? await db.select().from(recipe).where(collectionCondition)
        : await db
            .select()
            .from(recipe)
            .where(and(collectionCondition, eq(recipe.isPublic, true)));
    return { result };
  },
);
