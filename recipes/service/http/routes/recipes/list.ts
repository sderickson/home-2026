import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { recipeQueries } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "./_collection-auth.ts";
import { recipeToApiRecipe } from "./_helpers.ts";

export const listRecipesHandler = createHandler(async (req, res) => {
  const collectionId =
    typeof req.query.collectionId === "string"
      ? req.query.collectionId.trim()
      : "";

  if (!collectionId) {
    throw createError(400, "collectionId is required", {
      code: "VALIDATION_ERROR",
    });
  }

  await requireCollectionMembership(collectionId, {
    requireMutate: false,
  });

  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  // The validator may or may not have coerced the query string.
  const archived = String(req.query.archived) === "true";
  const { result } = await recipeQueries.listRecipes(recipesDbKey, {
    collectionId,
    archived,
  });

  const response: RecipesServiceResponseBody["listRecipes"][200] = {
    recipes: (result ?? []).map((row) => recipeToApiRecipe(row)),
  };

  res.status(200).json(response);
});
