import createError from "http-errors";
import { createHandler } from "@saflib/express";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  recipeNoteFileQueries,
  RecipeNotFoundError,
  RecipeNoteNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { notesFilesListResultToNotesFilesListRecipesResponse } from "./_helpers.ts";

type NotesFilesListRecipeError = RecipeNotFoundError | RecipeNoteNotFoundError;

export const notesFilesListRecipesHandler = createHandler(
  async (req, res) => {
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;
    const noteId = req.params.noteId as string;
    await getRecipeAndRequireCollectionAuth(id, { requireMutate: false });

    const out = await recipeNoteFileQueries.listRecipeNoteFile(recipesDbKey, {
      recipeId: id,
      noteId,
    });

    if (out.error) {
      const error: NotesFilesListRecipeError = out.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        case error instanceof RecipeNoteNotFoundError:
          throw createError(404, error.message, {
            code: "RECIPE_NOTE_NOT_FOUND",
          });
        default:
          throw error satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["notesFilesListRecipes"][200] =
      notesFilesListResultToNotesFilesListRecipesResponse(out.result, id);

    res.status(200).json(response);
  },
);
