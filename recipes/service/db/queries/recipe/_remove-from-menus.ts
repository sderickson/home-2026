import { eq } from "drizzle-orm";
import { menu } from "../../schemas/menu.ts";
import type { recipesDbManager } from "../../instances.ts";

type Db = NonNullable<ReturnType<typeof recipesDbManager.get>>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/**
 * Remove a recipe from every menu in its collection, inside the caller's
 * transaction. Returns the menus that changed.
 */
export function removeRecipeFromMenus(
  tx: Tx,
  recipeId: string,
  collectionId: string,
  now: Date,
): (typeof menu.$inferSelect)[] {
  const menus = tx
    .select()
    .from(menu)
    .where(eq(menu.collectionId, collectionId))
    .all();
  const changed: (typeof menu.$inferSelect)[] = [];
  for (const m of menus) {
    if (!m.groupings.some((g) => g.recipeIds.includes(recipeId))) continue;
    const [updated] = tx
      .update(menu)
      .set({
        groupings: m.groupings.map((g) => ({
          ...g,
          recipeIds: g.recipeIds.filter((id) => id !== recipeId),
        })),
        updatedAt: now,
      })
      .where(eq(menu.id, m.id))
      .returning()
      .all();
    changed.push(updated!);
  }
  return changed;
}
