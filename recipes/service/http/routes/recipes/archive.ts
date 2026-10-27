import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import {
  recipeQueries,
  RecipeNotFoundError,
  type SetArchivedRecipeError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { recipeToApiRecipe } from "./_helpers.ts";

export const archiveRecipeHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const id = req.params.id as string;
  const data: RecipesServiceRequestBody["archiveRecipe"] = req.body;
  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  await getRecipeAndRequireCollectionAuth(id, { requireMutate: true });

  const { result, error } = await recipeQueries.setArchivedRecipe(
    recipesDbKey,
    { id, archived: data.archived, updatedBy: auth.userId },
  );

  if (error) {
    const err: SetArchivedRecipeError = error;
    switch (true) {
      case err instanceof RecipeNotFoundError:
        throw createError(404, err.message, { code: "RECIPE_NOT_FOUND" });
      default:
        throw err satisfies never;
    }
  }

  const response: RecipesServiceResponseBody["archiveRecipe"][200] = {
    recipe: recipeToApiRecipe(result.recipe),
    removedFromMenus: result.removedFromMenus.map((m) => ({
      id: m.id,
      name: m.name,
    })),
  };
  res.status(200).json(response);
});
