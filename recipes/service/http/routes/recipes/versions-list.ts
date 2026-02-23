import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContext } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipeQueries, RecipeNotFoundError } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { versionsListResultToListRecipeVersionsResponse } from "./_helpers.ts";

type VersionsListRecipeError = RecipeNotFoundError;

export const versionsListRecipesHandler = createHandler(
  async (req, res) => {
    const store = getSafContext();
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;

    const getOut = await recipeQueries.getByIdRecipe(recipesDbKey, id);
    if (getOut.error) {
      const error: VersionsListRecipeError = getOut.error;
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
