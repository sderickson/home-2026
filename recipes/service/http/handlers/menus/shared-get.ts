import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { ResponseBody as sharedGetMenusResponseBody } from "@sderickson/recipes-spec/operations/sharedGetMenus";
import {
  menuQueries,
  recipeFileQueries,
  recipeQueries,
  MenuNotFoundError,
  RecipeNotFoundError,
  type RecipeEntity,
  type RecipeFileEntity,
  type RecipeVersionEntity,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { menuToApiMenu } from "../../routes/menus/_helpers.ts";
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

  const recipes: RecipeEntity[] = [];
  const versions: RecipeVersionEntity[] = [];
  const files: RecipeFileEntity[] = [];
  for (const recipeId of recipeIdsFromGroupings(menu.groupings)) {
    const recipeOut = await recipeQueries.getByIdRecipe(recipesDbKey, recipeId);
    if (recipeOut.error) {
      // Deleted since it was added to the menu: leave it out.
      if (recipeOut.error instanceof RecipeNotFoundError) continue;
      throw recipeOut.error satisfies never;
    }
    const { recipe, latestVersion } = recipeOut.result;
    // Same scope as the authenticated GET /menus/{id}: only the menu's own collection.
    if (recipe.collectionId !== menu.collectionId) continue;

    const filesOut = await recipeFileQueries.listRecipeFile(recipesDbKey, {
      recipeId,
    });
    if (filesOut.error) {
      if (filesOut.error instanceof RecipeNotFoundError) continue;
      throw filesOut.error satisfies never;
    }

    recipes.push(recipe);
    versions.push(latestVersion);
    files.push(...filesOut.result);
  }

  const found = new Set(recipes.map((r) => r.id));
  const response: SharedGetMenus200 = {
    menu: {
      ...menuToApiMenu(menu),
      groupings: menu.groupings.map((g) => ({
        name: g.name,
        recipeIds: g.recipeIds.filter((rid) => found.has(rid)),
      })),
    },
    recipes: recipes.map((r, i) => recipeToApiRecipe(r, versions[i]!.id)),
    currentVersions: versions.map(recipeVersionToApiRecipeVersion),
    files: files.map(recipeFileToSharedApiRecipeFile),
  };

  res.status(200).json(response);
});
