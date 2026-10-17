import { RecipeNotFoundError } from "@sderickson/recipes-db/errors";
import { listRecipeFile } from "@sderickson/recipes-db/queries/recipe-file/list";
import { getByIdRecipe } from "@sderickson/recipes-db/queries/recipe/get-by-id";
import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { ResponseBody as sharedGetRecipesResponseBody } from "@sderickson/recipes-spec/operations/sharedGetRecipes";

import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getByIdResultToSharedGetRecipesResponse } from "./_helpers.ts";

type SharedGetRecipeError = RecipeNotFoundError;

export const sharedGetRecipesHandler = createHandler(async (req, res) => {
  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  const id = req.params.id as string;

  const recipeOut = await getByIdRecipe(recipesDbKey, id);
  if (recipeOut.error) {
    const error: SharedGetRecipeError = recipeOut.error;
    switch (true) {
      case error instanceof RecipeNotFoundError:
        throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
      default:
        throw error satisfies never;
    }
  }

  const filesOut = await listRecipeFile(recipesDbKey, {
    recipeId: id,
  });
  if (filesOut.error) {
    const error: SharedGetRecipeError = filesOut.error;
    switch (true) {
      case error instanceof RecipeNotFoundError:
        throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
      default:
        throw error satisfies never;
    }
  }

  const response: sharedGetRecipesResponseBody["sharedGetRecipes"][200] =
    getByIdResultToSharedGetRecipesResponse(
      recipeOut.result.recipe,
      recipeOut.result.latestVersion,
      filesOut.result,
    );

  res.status(200).json(response);
});
