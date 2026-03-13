import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContext } from "@saflib/node";
import { recipeQueries } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { recipeToApiRecipe } from "./_helpers.ts";

export const listRecipesHandler = createHandler(async (req, res) => {
  const collectionId = req.query.collectionId;
  if (typeof collectionId !== "string" || !collectionId.trim()) {
    throw createError(400, "collectionId query parameter is required", {
      code: "VALIDATION_ERROR",
    });
  }

  const store = getSafContext();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const isAdmin = store.auth?.userScopes?.includes("*") ?? false;
  const { result } = await recipeQueries.listRecipes(recipesDbKey, {
    collectionId: collectionId.trim(),
    includePrivate: isAdmin,
  });

  const response: RecipesServiceResponseBody["listRecipes"][200] =
    (result ?? []).map((row) => recipeToApiRecipe(row));

  res.status(200).json(response);
});
