import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
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
    const id = req.params.id as string;
    const data: RecipesServiceRequestBody["createRecipeVersion"] =
      req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const authWithVerified = {
      ...auth,
      emailVerified: (auth as { emailVerified?: boolean }).emailVerified,
    };
    await getRecipeAndRequireCollectionAuth(
      recipesDbKey,
      id,
      authWithVerified,
      { requireMutate: true },
    );

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
