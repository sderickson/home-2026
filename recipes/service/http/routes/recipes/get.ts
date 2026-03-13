import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { getByIdResultToGetRecipeResponse } from "./_helpers.ts";

export const getRecipeHandler = createHandler(async (req, res) => {
  const { auth } = getSafContextWithAuth();
  const { recipesDbKey } = recipesServiceStorage.getStore()!;
  const id = req.params.id as string;
  const authWithVerified = {
    ...auth,
    emailVerified: (auth as { emailVerified?: boolean }).emailVerified,
  };

  const out = await getRecipeAndRequireCollectionAuth(
    recipesDbKey,
    id,
    authWithVerified,
    { requireMutate: false },
  );

  const response: RecipesServiceResponseBody["getRecipe"][200] =
    getByIdResultToGetRecipeResponse(out.recipe, out.latestVersion);
  res.status(200).json(response);
});
