import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipeQueries, RecipeNotFoundError } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { versionsListResultToListRecipeVersionsResponse } from "./_helpers.ts";

type VersionsListRecipeError = RecipeNotFoundError;

export const versionsListRecipesHandler = createHandler(
  async (req, res) => {
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;
    await getRecipeAndRequireCollectionAuth(id, { requireMutate: false });

    const out = await recipeQueries.versionsListRecipe(recipesDbKey, id);

    if (out.error) {
      const error: VersionsListRecipeError = out.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["listRecipeVersions"][200] =
      versionsListResultToListRecipeVersionsResponse(out.result.versions);

    res.status(200).json(response);
  },
);
