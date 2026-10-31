import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import {
  recipeFileQueries,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { getPhoto, trackDownload } from "@sderickson/recipes-unsplash";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { throwOnUnsplashError } from "../../unsplash-errors.ts";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { recipeFileToFilesFromUnsplashRecipesResponse } from "./_helpers.ts";

type FilesFromUnsplashRecipeError = RecipeNotFoundError;

export const filesFromUnsplashRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const id = req.params.id as string;
    const body =
      req.body as RecipesServiceRequestBody["filesFromUnsplashRecipes"];
    const { unsplashPhotoId } = body;

    const { recipesDbKey } = recipesServiceStorage.getStore()!;
    await getRecipeAndRequireCollectionAuth(id, { requireMutate: true });

    const photoResult = await getPhoto(unsplashPhotoId);
    if (photoResult.error) {
      throwOnUnsplashError(photoResult.error, "fetch photo");
    }
    const photoResponse = photoResult.result;
    const user = photoResponse.user as unknown as Record<string, unknown>;

    const trackResult = await trackDownload(unsplashPhotoId);
    if (trackResult.error) {
      throwOnUnsplashError(trackResult.error, "track download");
    }

    // Hotlinked rather than stored, per the Unsplash API guidelines. No blob.
    const insertOut = await recipeFileQueries.insertRecipeFile(recipesDbKey, {
      recipe_id: id,
      blob_name: "",
      file_original_name: `unsplash-${unsplashPhotoId}.jpg`,
      mimetype: "image/jpeg",
      size: 0,
      uploaded_by: auth.userId,
      unsplash_user: user,
      unsplash_photo_id: unsplashPhotoId,
      unsplash_image_url: photoResponse.urls.raw,
    });

    if (insertOut.error) {
      const error: FilesFromUnsplashRecipeError = insertOut.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }

    const response: RecipesServiceResponseBody["filesFromUnsplashRecipes"][200] =
      recipeFileToFilesFromUnsplashRecipesResponse(insertOut.result);

    res.status(200).json(response);
  },
);
