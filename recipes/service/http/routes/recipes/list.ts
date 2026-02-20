import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import { recipeQueries } from "@sderickson/recipes-db";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { recipeToApiRecipe } from "./_helpers.ts";

export const listRecipesHandler = createHandler(async (_req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;

  const isAdmin = auth.userScopes.includes("*");
  const { result } = await recipeQueries.listRecipes(recipesDbKey, {
    includePrivate: isAdmin,
  });

  const response: RecipesServiceResponseBody["listRecipes"][200] =
    (result ?? []).map((row) => recipeToApiRecipe(row));

  res.status(200).json(response);
});
