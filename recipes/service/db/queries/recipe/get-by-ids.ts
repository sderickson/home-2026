import { recipesDbManager } from "../../instances.ts";
import type { DbKey } from "@saflib/drizzle";
import { and, eq, inArray } from "drizzle-orm";
import { recipe } from "../../schemas/recipe.ts";

/**
 * Fetch recipes by ids that belong to the given collection. Returns only those
 * that exist and match collectionId; missing or wrong-collection ids are omitted.
 * Single query, no errors for missing ids.
 */
export async function getByIdsRecipe(
  dbKey: DbKey,
  ids: string[],
  collectionId: string,
): Promise<(typeof recipe.$inferSelect)[]> {
  if (ids.length === 0) return [];

  const db = recipesDbManager.get(dbKey)!;
  const rows = await db
    .select()
    .from(recipe)
    .where(
      and(inArray(recipe.id, ids), eq(recipe.collectionId, collectionId)),
    );
  return rows;
}
