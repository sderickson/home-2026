import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import { recipeQueries, RecipeNotFoundError } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { updateMetadataResultToUpdateRecipeResponse } from "./_helpers.ts";

type GetByIdRecipeError = RecipeNotFoundError;
type UpdateMetadataRecipeError = RecipeNotFoundError;

export const updateRecipeHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const id = req.params.id as string;
    const data: RecipesServiceRequestBody["updateRecipe"] = req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const userId = auth.userId;

    const getOut = await recipeQueries.getByIdRecipe(recipesDbKey, id);
    if (getOut.error) {
      const error: GetByIdRecipeError = getOut.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }

    const existing = getOut.result.recipe;
    const merged = {
      title: data.title ?? existing.title,
      shortDescription:
        data.shortDescription ?? existing.shortDescription,
      longDescription:
        data.longDescription !== undefined
          ? data.longDescription
          : existing.longDescription,
      isPublic: data.isPublic ?? existing.isPublic,
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
