import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import {
  recipeNoteQueries,
  RecipeNoteNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { updateNoteResultToNotesUpdateRecipesResponse } from "./_helpers.ts";

type UpdateNoteRecipeError = RecipeNoteNotFoundError;

export const notesUpdateRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const id = req.params.id as string;
    const noteId = req.params.noteId as string;
    const data: RecipesServiceRequestBody["notesUpdateRecipes"] =
      req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const userId = auth.userId;
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

    const { result, error } = await recipeNoteQueries.updateRecipeNote(
      recipesDbKey,
      {
        id: noteId,
        recipeId: id,
        body: data.body,
        updatedBy: userId,
      },
    );

    if (error) {
      const err: UpdateNoteRecipeError = error;
      switch (true) {
        case err instanceof RecipeNoteNotFoundError:
          throw createError(404, err.message, {
            code: "RECIPE_NOTE_NOT_FOUND",
          });
        default:
          throw err satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["notesUpdateRecipes"][200] =
      updateNoteResultToNotesUpdateRecipesResponse(result);
    res.status(200).json(response);
  },
);
