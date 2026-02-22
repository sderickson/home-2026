import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContext } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipeQueries, RecipeNotFoundError } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getByIdResultToGetRecipeResponse } from "./_helpers.ts";

type GetByIdRecipeError = RecipeNotFoundError;

export const getRecipeHandler = createHandler(
  async (req, res) => {
    const store = getSafContext();
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;

    const out = await recipeQueries.getByIdRecipe(recipesDbKey, id);

    if (out.error) {
      const error: GetByIdRecipeError = out.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }

    const isAdmin = store.auth?.userScopes?.includes("*") ?? false;
    if (!out.result.recipe.isPublic && !isAdmin) {
      throw createError(404, "Recipe not found", { code: "RECIPE_NOT_FOUND" });
    }

    const response: RecipesServiceResponseBody["getRecipe"][200] =
      getByIdResultToGetRecipeResponse(out.result.recipe, out.result.latestVersion);

    res.status(200).json(response);
  },
);
