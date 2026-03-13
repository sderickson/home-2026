import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
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

  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  const emailValidated =
    (auth as { emailVerified?: boolean }).emailVerified !== false;

  const member = await requireCollectionMembership({
    recipesDbKey,
    collectionId: collectionId.trim(),
    callerEmail: auth.userEmail,
    emailValidated,
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
