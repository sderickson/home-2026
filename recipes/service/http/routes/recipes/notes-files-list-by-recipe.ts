import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContext } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  recipeQueries,
  recipeNoteFileQueries,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { notesFilesListResultToNotesFilesListRecipesResponse } from "./_helpers.ts";

export const recipeNoteFilesGetByNoteIdHandler = createHandler(
  async (req, res) => {
    const store = getSafContext();
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;

    const getOut = await recipeQueries.getByIdRecipe(recipesDbKey, id);
    if (getOut.error) {
      const error = getOut.error;
      if (error instanceof RecipeNotFoundError) {
        throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
      }
      throw error;
    }

    const isAdmin = store.auth?.userScopes?.includes("*") ?? false;
    if (!getOut.result.recipe.isPublic && !isAdmin) {
      throw createError(404, "Recipe not found", { code: "RECIPE_NOT_FOUND" });
    }

    const out = await recipeNoteFileQueries.listRecipeNoteFilesByRecipeId(
      recipesDbKey,
      { recipeId: id },
    );

    const response: RecipesServiceResponseBody["recipeNoteFilesGetByNoteId"][200] =
      notesFilesListResultToNotesFilesListRecipesResponse(out.result ?? [], id);

    res.status(200).json(response);
  },
);
