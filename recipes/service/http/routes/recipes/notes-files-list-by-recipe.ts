import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipeNoteFileQueries } from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { notesFilesListResultToNotesFilesListRecipesResponse } from "./_helpers.ts";

export const recipeNoteFilesGetByNoteIdHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    const id = req.params.id as string;
    const authWithVerified = {
      ...auth,
      emailVerified: (auth as { emailVerified?: boolean }).emailVerified,
    };
    await getRecipeAndRequireCollectionAuth(
      recipesDbKey,
      id,
      authWithVerified,
      { requireMutate: false },
    );

    const out = await recipeNoteFileQueries.listRecipeNoteFilesByRecipeId(
      recipesDbKey,
      { recipeId: id },
    );

    const response: RecipesServiceResponseBody["recipeNoteFilesGetByNoteId"][200] =
      notesFilesListResultToNotesFilesListRecipesResponse(out.result ?? [], id);

    res.status(200).json(response);
  },
);
