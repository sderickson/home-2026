import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import { recipeQueries, RecipeNotFoundError } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { updateMetadataResultToUpdateRecipeResponse } from "./_helpers.ts";

type UpdateMetadataRecipeError = RecipeNotFoundError;

export const updateRecipeHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const id = req.params.id as string;
    const data: RecipesServiceRequestBody["updateRecipe"] = req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const userId = auth.userId;

    const getOut = await getRecipeAndRequireCollectionAuth(id, {
      requireMutate: true,
    });

    const existing = getOut.recipe;
    const merged = {
      title: data.title ?? existing.title,
      subtitle:
        data.subtitle ?? existing.subtitle,
      description:
        data.description !== undefined
          ? data.description
          : existing.description,
    };

    const { result, error } = await recipeQueries.updateMetadataRecipe(
      recipesDbKey,
      {
        id,
        ...merged,
        updatedBy: userId,
      },
    );

    if (error) {
      const err: UpdateMetadataRecipeError = error;
      switch (true) {
        case err instanceof RecipeNotFoundError:
          throw createError(404, err.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw err satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["updateRecipe"][200] =
      updateMetadataResultToUpdateRecipeResponse(result);
    res.status(200).json(response);
  },
);
