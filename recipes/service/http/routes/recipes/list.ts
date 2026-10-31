import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { recipeQueries } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { requireCollectionMembership } from "./_collection-auth.ts";
import {
  loadRecipeVersionsAndFiles,
  recipeFileToApiRecipeFile,
  recipeToApiRecipe,
  recipeVersionToApiRecipeVersion,
} from "./_helpers.ts";

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

  const rows = result ?? [];
  const { versions, files } = await loadRecipeVersionsAndFiles(
    recipesDbKey,
    rows.map((row) => row.id),
  );
  const versionIdByRecipeId = new Map(versions.map((v) => [v.recipeId, v.id]));

  const response: RecipesServiceResponseBody["listRecipes"][200] = {
    recipes: rows.map((row) =>
      recipeToApiRecipe(row, versionIdByRecipeId.get(row.id)),
    ),
    currentVersions: versions.map(recipeVersionToApiRecipeVersion),
    files: files.map(recipeFileToApiRecipeFile),
  };

  res.status(200).json(response);
});
