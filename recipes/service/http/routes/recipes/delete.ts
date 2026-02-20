import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import { recipeQueries, RecipeNotFoundError, type DeleteRecipeError } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { deleteRecipeResultToDeleteRecipeResponse } from "./_helpers.ts";

export const deleteRecipeHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const id = req.params.id as string;
    const { recipesDbKey } = recipesServiceStorage.getStore()!;

    const { result, error } = await recipeQueries.deleteRecipe(recipesDbKey, id);

    if (error) {
      const err: DeleteRecipeError = error;
      switch (true) {
        case err instanceof RecipeNotFoundError:
          throw createError(404, err.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw err satisfies never;
      }
    }

    deleteRecipeResultToDeleteRecipeResponse(result);
    res.status(204).end();
  },
);
