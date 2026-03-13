import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import {
  recipeQueries,
  recipeFileQueries,
  recipeNoteFileQueries,
  RecipeNotFoundError,
  type DeleteRecipeError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { deleteRecipeResultToDeleteRecipeResponse } from "./_helpers.ts";

export const deleteRecipeHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const id = req.params.id as string;
    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;

    const authWithVerified = {
      ...auth,
      emailVerified: (auth as { emailVerified?: boolean }).emailVerified,
    };
    await getRecipeAndRequireCollectionAuth(
      recipesDbKey,
      id,
      authWithVerified,
      { requireMutate: true },
    );

    const [filesListOut, noteFilesListOut] = await Promise.all([
      recipeFileQueries.listRecipeFile(recipesDbKey, { recipeId: id }),
      recipeNoteFileQueries.listRecipeNoteFilesByRecipeId(recipesDbKey, {
        recipeId: id,
      }),
    ]);

    for (const file of filesListOut.result ?? []) {
      await recipesFileContainer.deleteFile(file.blob_name);
    }
    for (const file of noteFilesListOut.result ?? []) {
      await recipesFileContainer.deleteFile(file.blob_name);
    }

    const { result, error } = await recipeQueries.deleteRecipe(recipesDbKey, id);

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
