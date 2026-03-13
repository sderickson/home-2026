import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import {
  recipeNoteQueries,
  RecipeNoteNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { deleteNoteResultToNotesDeleteRecipesResponse } from "./_helpers.ts";

type DeleteNoteRecipeError = RecipeNoteNotFoundError;

export const notesDeleteRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const id = req.params.id as string;
    const noteId = req.params.noteId as string;
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
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

    const { result, error } = await recipeNoteQueries.deleteRecipeNote(
      recipesDbKey,
      noteId,
    );

    if (error) {
      const err: DeleteNoteRecipeError = error;
      switch (true) {
        case err instanceof RecipeNoteNotFoundError:
          throw createError(404, err.message, {
            code: "RECIPE_NOTE_NOT_FOUND",
          });
        default:
          throw err satisfies never;
      }
    }

    deleteNoteResultToNotesDeleteRecipesResponse(result);
    res.status(204).end();
  },
);
