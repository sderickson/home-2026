import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import {
  recipeNoteQueries,
  RecipeNotFoundError,
  RecipeVersionNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { createNoteResultToNotesCreateRecipesResponse } from "./_helpers.ts";

type CreateNoteRecipeError = RecipeNotFoundError | RecipeVersionNotFoundError;

export const notesCreateRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const id = req.params.id as string;
    const data: RecipesServiceRequestBody["notesCreateRecipes"] =
      req.body ?? {};
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const userId = auth.userId;

    const { result, error } = await recipeNoteQueries.createRecipeNote(
      recipesDbKey,
      {
        recipeId: id,
        recipeVersionId: data.recipeVersionId ?? null,
        body: data.body,
        everEdited: false,
        createdBy: userId,
        updatedBy: userId,
      },
    );

    if (error) {
      const err: CreateNoteRecipeError = error;
      switch (true) {
        case err instanceof RecipeNotFoundError:
          throw createError(404, err.message, { code: "RECIPE_NOT_FOUND" });
        case err instanceof RecipeVersionNotFoundError:
          throw createError(404, err.message, {
            code: "RECIPE_VERSION_NOT_FOUND",
          });
        default:
          throw err satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["notesCreateRecipes"][200] =
      createNoteResultToNotesCreateRecipesResponse(result);
    res.status(200).json(response);
  },
);
