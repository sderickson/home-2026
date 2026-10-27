import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import {
  recipeQueries,
  RecipeVersionNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { updateLatestVersionResultToUpdateRecipeVersionLatestResponse } from "./_helpers.ts";
import { sanitizeVersionContent } from "./_markdown.ts";

type UpdateLatestVersionRecipeError = RecipeVersionNotFoundError;

export const versionsLatestUpdateRecipesHandler = createHandler(
  async (req, res) => {
    getSafContextWithAuth();
    const id = req.params.id as string;
    const data: RecipesServiceRequestBody["updateRecipeVersionLatest"] =
      req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    await getRecipeAndRequireCollectionAuth(id, { requireMutate: true });
    const { content, removedHtml } = sanitizeVersionContent(data);

    const { result, error } = await recipeQueries.updateLatestVersionRecipe(
      recipesDbKey,
      { recipeId: id, content },
    );

    if (error) {
      const err: UpdateLatestVersionRecipeError = error;
      switch (true) {
        case err instanceof RecipeVersionNotFoundError:
          throw createError(404, err.message, {
            code: "RECIPE_VERSION_NOT_FOUND",
          });
        default:
          throw err satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["updateRecipeVersionLatest"][200] =
      updateLatestVersionResultToUpdateRecipeVersionLatestResponse(result, removedHtml);
    res.status(200).json(response);
  },
);
