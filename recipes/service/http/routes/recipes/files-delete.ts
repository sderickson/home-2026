import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import {
  recipeFileQueries,
  RecipeFileNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { deleteFileResultToFilesDeleteRecipesResponse } from "./_helpers.ts";

type FilesDeleteRecipeError = RecipeFileNotFoundError;

export const filesDeleteRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const id = req.params.id as string;
    const fileId = req.params.fileId as string;
    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;

    const { result, error } = await recipeFileQueries.deleteRecipeFile(
      recipesDbKey,
      fileId,
    );

    if (error) {
      const err: FilesDeleteRecipeError = error;
      switch (true) {
        case err instanceof RecipeFileNotFoundError:
          throw createError(404, err.message, {
            code: "RECIPE_FILE_NOT_FOUND",
          });
        default:
          throw err satisfies never;
      }
    }

    if (result.recipe_id !== id) {
      throw createError(404, "Recipe file not found", {
        code: "RECIPE_FILE_NOT_FOUND",
      });
    }

    await recipesFileContainer.deleteFile(result.blob_name);

    deleteFileResultToFilesDeleteRecipesResponse(result);
    res.status(204).end();
  },
);
