import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  menuQueries,
  recipeQueries,
  MenuNotFoundError,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import type { RecipeEntity } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "../recipes/_collection-auth.ts";
import { getMenuResultToGetMenuResponse } from "./_helpers.ts";

/** Collect unique recipe ids from menu groupings in order of first appearance. */
function recipeIdsFromGroupings(
  groupings: { name: string; recipeIds: string[] }[],
): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const g of groupings) {
    for (const id of g.recipeIds) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
}

export const getMenuHandler = createHandler(async (req, res) => {
  const id = req.params.id as string;
  const collectionId =
    typeof req.query.collectionId === "string"
      ? req.query.collectionId.trim()
      : "";

  if (!collectionId) {
    throw createError(400, "collectionId is required", {
      code: "VALIDATION_ERROR",
    });
  }

  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const { result: menu, error: menuError } = await menuQueries.getByIdMenu(
    recipesDbKey,
    id,
  );

  if (menuError) {
    switch (true) {
      case menuError instanceof MenuNotFoundError:
        throw createError(404, menuError.message, { code: "MENU_NOT_FOUND" });
      default:
        throw menuError satisfies never;
    }
  }

  if (menu!.collectionId !== collectionId) {
    throw createError(403, "Menu not in collection", { code: "FORBIDDEN" });
  }

  await requireCollectionMembership(collectionId, {
    requireMutate: false,
  });

  const recipeIds = recipeIdsFromGroupings(menu!.groupings);
  const recipeEntities: RecipeEntity[] = [];

  for (const recipeId of recipeIds) {
    const out = await recipeQueries.getByIdRecipe(recipesDbKey, recipeId);
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
      throw createError(404, "Recipe not in menu collection", {
        code: "RECIPE_NOT_FOUND",
      });
    }
    recipeEntities.push(out.result.recipe);
  }

  const response: RecipesServiceResponseBody["getMenu"][200] =
    getMenuResultToGetMenuResponse(menu!, recipeEntities);

  res.status(200).json(response);
});
