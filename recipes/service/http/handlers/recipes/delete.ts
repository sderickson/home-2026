import { RecipeNotFoundError } from "@sderickson/recipes-db/errors";
import { listRecipeFile } from "@sderickson/recipes-db/queries/recipe-file/list";
import { type DeleteRecipeError, deleteRecipe } from "@sderickson/recipes-db/queries/recipe/delete";
import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";

import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { deleteRecipeResultToDeleteRecipeResponse } from "./_helpers.ts";

export const deleteRecipeHandler = createHandler(
  async (req, res) => {
    getSafContextWithAuth();
    const id = req.params.id as string;
    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;

    await getRecipeAndRequireCollectionAuth(id, { requireMutate: true });

    const filesListOut = await listRecipeFile(recipesDbKey, {
      recipeId: id,
    });

    for (const file of filesListOut.result ?? []) {
      await recipesFileContainer.deleteFile(file.blob_name);
    }
    const { result, error } = await deleteRecipe(recipesDbKey, id);

    if (error) {
      const err: DeleteRecipeError = error;
      switch (true) {
        case err instanceof RecipeNotFoundError:
          throw createError(404, err.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw err satisfies never;
      }
    }

    deleteRecipeResultToDeleteRecipeResponse(result);
    res.status(204).end();
  },
);
