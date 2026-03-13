import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { recipeQueries } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "./_collection-auth.ts";
import { recipeToApiRecipe } from "./_helpers.ts";

export const listRecipesHandler = createHandler(async (req, res) => {
  const collectionId = req.query.collectionId;
  if (typeof collectionId !== "string" || !collectionId.trim()) {
    throw createError(400, "collectionId query parameter is required", {
      code: "VALIDATION_ERROR",
    });
  }

  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  const member = await requireCollectionMembership(collectionId.trim(), {
    requireMutate: false,
  });

  const includePrivate = member.role !== "viewer";
  const { result } = await recipeQueries.listRecipes(recipesDbKey, {
    collectionId: collectionId.trim(),
    includePrivate,
  });

  const response: RecipesServiceResponseBody["listRecipes"][200] =
    (result ?? []).map((row) => recipeToApiRecipe(row));

  res.status(200).json(response);
});
