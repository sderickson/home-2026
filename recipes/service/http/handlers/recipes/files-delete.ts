import createError from "http-errors";
import { createHandler } from "@saflib/express";
import {
  recipeFileQueries,
  RecipeNotFoundError,
  RecipeFileNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { deleteFileResultToFilesDeleteRecipesResponse } from "./_helpers.ts";

export const filesDeleteRecipesHandler = createHandler(async (req, res) => {
  const id = req.params.id as string;
  const fileId = req.params.fileId as string;
  const { recipesDbKey, recipesFileContainer } =
    recipesServiceStorage.getStore()!;
  await getRecipeAndRequireCollectionAuth(id, { requireMutate: true });

  const listOut = await recipeFileQueries.listRecipeFile(recipesDbKey, {
    recipeId: id,
  });
  if (listOut.error) {
    const err = listOut.error;
    switch (true) {
      case err instanceof RecipeNotFoundError:
        throw createError(404, err.message, {
          code: "RECIPE_NOT_FOUND",
        });
      default:
        throw err satisfies never;
    }
  }

  const file = listOut.result.find((f) => f.id === fileId);
  if (!file) {
    throw createError(404, "Recipe file not found", {
      code: "RECIPE_FILE_NOT_FOUND",
    });
  }

  await recipesFileContainer.deleteFile(file.blob_name);

  const deleteOut = await recipeFileQueries.deleteRecipeFile(
    recipesDbKey,
    fileId,
  );
  if (deleteOut.error) {
    const err: RecipeFileNotFoundError = deleteOut.error;
    throw createError(404, err.message, {
      code: "RECIPE_FILE_NOT_FOUND",
    });
  }

  deleteFileResultToFilesDeleteRecipesResponse(deleteOut.result);
  res.status(204).end();
});
