import { recipesDbManager } from "../../instances.ts";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import type { ReturnsError } from "@saflib/monorepo";
import { eq } from "drizzle-orm";
import { recipe } from "../../schemas/recipe.ts";

export interface ListRecipesParams {
  /** Id of the collection to list recipes from. */
  collectionId: string;
}

export const listRecipes = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListRecipesParams,
  ): Promise<ReturnsError<typeof recipe.$inferSelect[], never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .select()
      .from(recipe)
      .where(eq(recipe.collectionId, params.collectionId));
    return { result };
  },
);
