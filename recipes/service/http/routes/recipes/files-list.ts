import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContext } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  recipeQueries,
  recipeFileQueries,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { filesListResultToFilesListRecipesResponse } from "./_helpers.ts";

type FilesListRecipeError = RecipeNotFoundError;

export const filesListRecipesHandler = createHandler(
  async (req, res) => {
    const store = getSafContext();
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;

    const getOut = await recipeQueries.getByIdRecipe(recipesDbKey, id);
    if (getOut.error) {
      const error: FilesListRecipeError = getOut.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }
    const isAdmin = store.auth?.userScopes?.includes("*") ?? false;
    if (!getOut.result.recipe.isPublic && !isAdmin) {
      throw createError(404, "Recipe not found", { code: "RECIPE_NOT_FOUND" });
    }

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
