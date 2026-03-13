import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  recipeFileQueries,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { filesListResultToFilesListRecipesResponse } from "./_helpers.ts";

type FilesListRecipeError = RecipeNotFoundError;

export const filesListRecipesHandler = createHandler(
  async (req, res) => {
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;
    await getRecipeAndRequireCollectionAuth(id, { requireMutate: false });

    const out = await recipeFileQueries.listRecipeFile(recipesDbKey, {
      recipeId: id,
    });

    if (out.error) {
      const error: FilesListRecipeError = out.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["filesListRecipes"][200] =
      filesListResultToFilesListRecipesResponse(out.result);

    res.status(200).json(response);
  },
);
