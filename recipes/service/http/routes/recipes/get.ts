import { createHandler } from "@saflib/express";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { getByIdResultToGetRecipeResponse } from "./_helpers.ts";

export const getRecipeHandler = createHandler(async (req, res) => {
  const id = req.params.id as string;
  const collectionId =
    typeof req.query.collectionId === "string"
      ? req.query.collectionId.trim() || undefined
      : undefined;
  const out = await getRecipeAndRequireCollectionAuth(id, {
    requireMutate: false,
    collectionId,
    publicOnlyIfOmitted: true,
  });

  const response: RecipesServiceResponseBody["getRecipe"][200] =
    getByIdResultToGetRecipeResponse(out.recipe, out.latestVersion);
  res.status(200).json(response);
});
