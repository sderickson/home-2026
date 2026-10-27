import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/utils";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipe } from "../../schemas/recipe.ts";
import { menu } from "../../schemas/menu.ts";

export type SetArchivedRecipeError = RecipeNotFoundError;

export interface SetArchivedRecipeParams {
  id: string;
  archived: boolean;
  updatedBy: string;
}

export interface SetArchivedRecipeResult {
  recipe: typeof recipe.$inferSelect;
  /** Menus the recipe was removed from (archiving only). */
  removedFromMenus: (typeof menu.$inferSelect)[];
}

/**
 * Archive or unarchive a recipe. Archiving also removes it from every menu in
 * its collection; unarchiving doesn't put it back.
 */
export const setArchivedRecipe = queryWrapper(
  async (
    dbKey: DbKey,
    params: SetArchivedRecipeParams,
  ): Promise<ReturnsError<SetArchivedRecipeResult, SetArchivedRecipeError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();

    const result = db.transaction((tx) => {
      const [updated] = tx
        .update(recipe)
        .set({
          archivedAt: params.archived ? now : null,
          updatedBy: params.updatedBy,
          updatedAt: now,
        })
        .where(eq(recipe.id, params.id))
        .returning()
        .all();
      if (!updated) return undefined;
      if (!params.archived) return { recipe: updated, removedFromMenus: [] };

      const menus = tx
        .select()
        .from(menu)
        .where(eq(menu.collectionId, updated.collectionId))
        .all();
      const removedFromMenus = [];
      for (const m of menus) {
        if (!m.groupings.some((g) => g.recipeIds.includes(params.id))) {
          continue;
        }
        const [updatedMenu] = tx
          .update(menu)
          .set({
            groupings: m.groupings.map((g) => ({
              ...g,
              recipeIds: g.recipeIds.filter((id) => id !== params.id),
            })),
            updatedAt: now,
          })
          .where(eq(menu.id, m.id))
          .returning()
          .all();
        removedFromMenus.push(updatedMenu!);
      }
      return { recipe: updated, removedFromMenus };
    });

    if (!result) {
      return {
        error: new RecipeNotFoundError(
          `Recipe with id '${params.id}' not found`,
        ),
      };
    }
    return { result };
  },
);
