import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  menuQueries,
  recipeQueries,
  MenuNotFoundError,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { getByIdResultToGetRecipeResponse } from "./_helpers.ts";

function recipeIdInMenuGroupings(
  groupings: { name: string; recipeIds: string[] }[],
  recipeId: string,
): boolean {
  for (const g of groupings) {
    if (g.recipeIds.includes(recipeId)) return true;
  }
  return false;
}

export const getRecipeHandler = createHandler(async (req, res) => {
  const id = req.params.id as string;
  const menuId =
    typeof req.query.menuId === "string" ? req.query.menuId.trim() : "";

  if (menuId) {
    const { recipesDbKey } = recipesServiceStorage.getStore()!;

    const { result: menu, error: menuError } =
      await menuQueries.getByIdMenu(recipesDbKey, menuId);

    if (menuError) {
      switch (true) {
        case menuError instanceof MenuNotFoundError:
          throw createError(404, menuError.message, { code: "MENU_NOT_FOUND" });
        default:
          throw menuError satisfies never;
      }
    }

    if (menu!.isPublic && recipeIdInMenuGroupings(menu!.groupings, id)) {
      const out = await recipeQueries.getByIdRecipe(recipesDbKey, id);
      if (out.error) {
        switch (true) {
          case out.error instanceof RecipeNotFoundError:
            throw createError(404, out.error.message, {
              code: "RECIPE_NOT_FOUND",
            });
          default:
            throw out.error satisfies never;
        }
      }
      if (out.result.recipe.collectionId !== menu!.collectionId) {
        throw createError(404, "Recipe not in menu", {
          code: "RECIPE_NOT_FOUND",
        });
      }
      const response: RecipesServiceResponseBody["getRecipe"][200] =
        getByIdResultToGetRecipeResponse(
          out.result.recipe,
          out.result.latestVersion,
        );
      res.status(200).json(response);
      return;
    }
  }

  const out = await getRecipeAndRequireCollectionAuth(id, {
    requireMutate: false,
  });

  const response: RecipesServiceResponseBody["getRecipe"][200] =
    getByIdResultToGetRecipeResponse(out.recipe, out.latestVersion);
  res.status(200).json(response);
});
