import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { recipeQueries } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "./_collection-auth.ts";
import { recipeToApiRecipe } from "./_helpers.ts";

function parsePublicOnly(value: unknown): boolean {
  if (value === true || value === "true") return true;
  if (value === false || value === "false" || value === undefined) return false;
  return false;
}

export const listRecipesHandler = createHandler(async (req, res) => {
  const collectionId =
    typeof req.query.collectionId === "string"
      ? req.query.collectionId.trim()
      : "";
  const publicOnly = parsePublicOnly(req.query.publicOnly);

  const hasCollection = collectionId.length > 0;
  if (hasCollection && publicOnly) {
    throw createError(
      400,
      "Provide either collectionId or publicOnly=true, not both",
      { code: "VALIDATION_ERROR" },
    );
  }
  if (!hasCollection && !publicOnly) {
    throw createError(
      400,
      "Provide either collectionId or publicOnly=true",
      { code: "VALIDATION_ERROR" },
    );
  }

  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  if (publicOnly) {
    const { result } = await recipeQueries.listPublicRecipes(recipesDbKey);
    const response: RecipesServiceResponseBody["listRecipes"][200] =
      (result ?? []).map((row) => recipeToApiRecipe(row));
    res.status(200).json(response);
    return;
  }

  const member = await requireCollectionMembership(collectionId, {
    requireMutate: false,
  });

  const includePrivate = member.role !== "viewer";
  const { result } = await recipeQueries.listRecipes(recipesDbKey, {
    collectionId,
    includePrivate,
  });

  const response: RecipesServiceResponseBody["listRecipes"][200] =
    (result ?? []).map((row) => recipeToApiRecipe(row));

  res.status(200).json(response);
});
