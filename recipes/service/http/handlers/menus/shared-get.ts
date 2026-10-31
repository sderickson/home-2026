import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { ResponseBody as sharedGetMenusResponseBody } from "@sderickson/recipes-spec/operations/sharedGetMenus";
import {
  menuQueries,
  recipeQueries,
  MenuNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { menuToApiMenu } from "../../routes/menus/_helpers.ts";
import { loadRecipeVersionsAndFiles } from "../../routes/recipes/_helpers.ts";
import {
  recipeFileToSharedApiRecipeFile,
  recipeToApiRecipe,
  recipeVersionToApiRecipeVersion,
} from "../recipes/_helpers.ts";

type SharedGetMenus200 = sharedGetMenusResponseBody["sharedGetMenus"][200];

/** Unique recipe ids from menu groupings, in order of first appearance. */
function recipeIdsFromGroupings(
  groupings: { name: string; recipeIds: string[] }[],
): string[] {
  return [...new Set(groupings.flatMap((g) => g.recipeIds))];
}

export const sharedGetMenusHandler = createHandler(async (req, res) => {
  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  const id = req.params.id as string;

  const menuOut = await menuQueries.getByIdMenu(recipesDbKey, id);
  if (menuOut.error) {
    const error = menuOut.error;
    switch (true) {
      case error instanceof MenuNotFoundError:
        throw createError(404, error.message, { code: "MENU_NOT_FOUND" });
      default:
        throw error satisfies never;
    }
  }
  const menu = menuOut.result;

  // Same scope as the authenticated GET /menus/{id}: only the menu's own
  // collection. Recipes deleted since they were added are left out.
  const recipeIds = recipeIdsFromGroupings(menu.groupings);
  const recipes = (
    await recipeQueries.getByIdsRecipe(
      recipesDbKey,
      recipeIds,
      menu.collectionId,
    )
  ).sort((a, b) => recipeIds.indexOf(a.id) - recipeIds.indexOf(b.id));
  const { versions, files } = await loadRecipeVersionsAndFiles(
    recipesDbKey,
    recipes.map((r) => r.id),
  );
  const versionIdByRecipeId = new Map(versions.map((v) => [v.recipeId, v.id]));

  const found = new Set(recipes.map((r) => r.id));
  const response: SharedGetMenus200 = {
    menu: {
      ...menuToApiMenu(menu),
      groupings: menu.groupings.map((g) => ({
        name: g.name,
        recipeIds: g.recipeIds.filter((rid) => found.has(rid)),
      })),
    },
    recipes: recipes.map((r) =>
      recipeToApiRecipe(r, versionIdByRecipeId.get(r.id)),
    ),
    currentVersions: versions.map(recipeVersionToApiRecipeVersion),
    files: files.map(recipeFileToSharedApiRecipeFile),
  };

  res.status(200).json(response);
});
