import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import {
  recipeNoteFileQueries,
  RecipeNoteNotFoundError,
  RecipeNoteFileNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { deleteNoteFileResultToNotesFilesDeleteRecipesResponse } from "./_helpers.ts";

export const notesFilesDeleteRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const id = req.params.id as string;
    const noteId = req.params.noteId as string;
    const fileId = req.params.fileId as string;
    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;

    const listOut = await recipeNoteFileQueries.listRecipeNoteFile(
      recipesDbKey,
      { recipeId: id, noteId },
    );

    if (listOut.error) {
      const err = listOut.error;
      switch (true) {
        case err instanceof RecipeNoteNotFoundError:
          throw createError(404, err.message, {
            code: "RECIPE_NOTE_NOT_FOUND",
          });
        default:
          throw err satisfies never;
      }
    }

    const file = listOut.result.find((f) => f.id === fileId);
    if (!file) {
      throw createError(404, "Recipe note file not found", {
        code: "RECIPE_NOTE_FILE_NOT_FOUND",
      });
    }

    await recipesFileContainer.deleteFile(file.blob_name);

    const deleteOut = await recipeNoteFileQueries.deleteRecipeNoteFile(
      recipesDbKey,
      fileId,
    );

    if (deleteOut.error) {
      const err = deleteOut.error;
      switch (true) {
        case err instanceof RecipeNoteFileNotFoundError:
          throw createError(404, err.message, {
            code: "RECIPE_NOTE_FILE_NOT_FOUND",
          });
        default:
          throw err satisfies never;
      }
    }

    deleteNoteFileResultToNotesFilesDeleteRecipesResponse(deleteOut.result);
    res.status(204).end();
  },
);
