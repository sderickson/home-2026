import { recipesDbManager } from "../../instances.ts";
import type { DbKey } from "@saflib/drizzle";
import { and, eq, inArray } from "drizzle-orm";
import { recipeVersion } from "../../schemas/recipe.ts";

/**
 * Fetch the latest version of each of the given recipes. Recipes without a
 * version are omitted. Single query, no errors for missing ids.
 */
export async function getLatestVersionsByIdsRecipe(
  dbKey: DbKey,
  recipeIds: string[],
): Promise<(typeof recipeVersion.$inferSelect)[]> {
  if (recipeIds.length === 0) return [];

  const db = recipesDbManager.get(dbKey)!;
  return db
    .select()
    .from(recipeVersion)
    .where(
      and(
        inArray(recipeVersion.recipeId, recipeIds),
        eq(recipeVersion.isLatest, true),
      ),
    );
}
