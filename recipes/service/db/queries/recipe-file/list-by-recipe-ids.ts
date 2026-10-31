import { recipesDbManager } from "../../instances.ts";
import type { DbKey } from "@saflib/drizzle";
import { inArray } from "drizzle-orm";
import { recipeFile } from "../../schemas/recipe-file.ts";

/**
 * Fetch every file for the given recipes. Single query, no errors for missing
 * ids.
 */
export async function listByRecipeIdsRecipeFile(
  dbKey: DbKey,
  recipeIds: string[],
): Promise<(typeof recipeFile.$inferSelect)[]> {
  if (recipeIds.length === 0) return [];

  const db = recipesDbManager.get(dbKey)!;
  return db
    .select()
    .from(recipeFile)
    .where(inArray(recipeFile.recipe_id, recipeIds));
}
