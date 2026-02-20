import { recipesDbManager } from "../../instances.ts";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import type { ReturnsError } from "@saflib/monorepo";
import { eq } from "drizzle-orm";
import { recipe } from "../../schemas/recipe.ts";

export interface ListRecipesParams {
  /** When true (admin), return all recipes. When false or omitted, only public recipes. */
  includePrivate?: boolean;
}

export const listRecipes = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListRecipesParams = {},
  ): Promise<ReturnsError<typeof recipe.$inferSelect[], never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const result =
      params.includePrivate === true
        ? await db.select().from(recipe)
        : await db.select().from(recipe).where(eq(recipe.isPublic, true));
    return { result };
  },
);
