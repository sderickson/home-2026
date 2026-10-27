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
import { sanitizeVersionContent } from "./_markdown.ts";

type CreateVersionRecipeError = RecipeNotFoundError;

export const versionsCreateRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const id = req.params.id as string;
    const data: RecipesServiceRequestBody["createRecipeVersion"] =
      req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    await getRecipeAndRequireCollectionAuth(id, { requireMutate: true });
    const { content, removedHtml } = sanitizeVersionContent(data);

    const { result, error } = await recipeQueries.createVersionRecipe(
      recipesDbKey,
      {
        recipeId: id,
        content,
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
      createVersionResultToCreateRecipeVersionResponse(result, removedHtml);
    res.status(200).json(response);
  },
);
