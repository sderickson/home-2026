import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContext } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  recipeQueries,
  recipeNoteFileQueries,
  RecipeNotFoundError,
  RecipeNoteNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { notesFilesListResultToNotesFilesListRecipesResponse } from "./_helpers.ts";

type NotesFilesListRecipeError = RecipeNotFoundError | RecipeNoteNotFoundError;

export const notesFilesListRecipesHandler = createHandler(
  async (req, res) => {
    const store = getSafContext();
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;
    const noteId = req.params.noteId as string;

    const getOut = await recipeQueries.getByIdRecipe(recipesDbKey, id);
    if (getOut.error) {
      const error = getOut.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }
    const isAdmin = store.auth?.userScopes?.includes("*") ?? false;
    if (!getOut.result.recipe.isPublic && !isAdmin) {
      throw createError(404, "Recipe not found", { code: "RECIPE_NOT_FOUND" });
    }

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
