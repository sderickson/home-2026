import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import { recipeQueries, RecipeNotFoundError } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { createVersionResultToCreateRecipeVersionResponse } from "./_helpers.ts";

type CreateVersionRecipeError = RecipeNotFoundError;

export const versionsCreateRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const id = req.params.id as string;
    const data: RecipesServiceRequestBody["createRecipeVersion"] =
      req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;

    const { result, error } = await recipeQueries.createVersionRecipe(
      recipesDbKey,
      {
        recipeId: id,
        content: data,
        createdBy: auth.userId,
      },
    );

    if (error) {
      const err: CreateVersionRecipeError = error;
      switch (true) {
        case err instanceof RecipeNotFoundError:
          throw createError(404, err.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw err satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["createRecipeVersion"][200] =
      createVersionResultToCreateRecipeVersionResponse(result);
    res.status(200).json(response);
  },
);
