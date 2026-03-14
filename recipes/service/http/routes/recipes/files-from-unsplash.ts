import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import { Readable } from "stream";
import type {
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
} from "@sderickson/recipes-spec";
import {
  generateShortId,
  recipeFileQueries,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { unsplash } from "@sderickson/recipes-unsplash";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import {
  isUnsplashRateLimit,
  throwUnsplashRateLimitError,
} from "../../unsplash-rate-limit.ts";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { recipeFileToApiRecipeFile } from "./_helpers.ts";

type FilesFromUnsplashRecipeError = RecipeNotFoundError;

function unwrapUnsplash<T>(
  result: { type: "success"; response: T } | { type: string; [k: string]: unknown },
): T {
  if (result.type !== "success") {
    if (isUnsplashRateLimit(result)) throwUnsplashRateLimitError();
    throw createError(502, "Unsplash request failed", {
      code: "UNSPLASH_ERROR",
    });
  }
  return result.response as T;
}

export const filesFromUnsplashRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const id = req.params.id as string;
    const body =
      req.body as RecipesServiceRequestBody["filesFromUnsplashRecipes"];
    const { unsplashPhotoId, downloadLocation, imageUrl } = body;

    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;
    await getRecipeAndRequireCollectionAuth(id, { requireMutate: true });

    let photoResult: Awaited<ReturnType<typeof unsplash.photos.get>>;
    let trackResult: Awaited<ReturnType<typeof unsplash.photos.trackDownload>>;
    try {
      photoResult = await unsplash.photos.get({ photoId: unsplashPhotoId });
    } catch (e) {
      if (isUnsplashRateLimit(e)) throwUnsplashRateLimitError();
      throw createError(502, "Failed to fetch Unsplash photo", {
        code: "UNSPLASH_ERROR",
      });
    }
    const photoResponse = unwrapUnsplash(photoResult) as {
      user: unknown;
    };

    try {
      trackResult = await unsplash.photos.trackDownload({
        downloadLocation,
      });
    } catch (e) {
      if (isUnsplashRateLimit(e)) throwUnsplashRateLimitError();
      throw createError(502, "Failed to track Unsplash download", {
        code: "UNSPLASH_ERROR",
      });
    }
    unwrapUnsplash(trackResult);

    const user = photoResponse.user as Record<string, unknown>;

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw createError(502, "Failed to fetch image", {
        code: "IMAGE_FETCH_FAILED",
      });
    }
    const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
    const size = imageBytes.length;
    const contentType = imageResponse.headers.get("content-type");
    const mimetype = contentType?.split(";")[0]?.trim() || "image/jpeg";
    const ext = mimetype === "image/png" ? "png" : "jpg";
    const fileOriginalName = `unsplash-${unsplashPhotoId}.${ext}`;

    const pathId = generateShortId();
    const blob_name = `recipes/${id}/${pathId}`;

    const insertOut = await recipeFileQueries.insertRecipeFile(recipesDbKey, {
      recipe_id: id,
      blob_name,
      file_original_name: fileOriginalName,
      mimetype,
      size,
      uploaded_by: auth.userId,
      unsplash_user: user,
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

    const stream = Readable.from(Buffer.from(imageBytes));
    const uploadResult = await recipesFileContainer.uploadFile(
      blob_name,
      stream,
      {
        mimetype,
        filename: fileOriginalName,
      },
    );

    if (uploadResult.error) {
      await recipeFileQueries.deleteRecipeFile(
        recipesDbKey,
        insertOut.result.id,
      );
      throw createError(500, "Failed to upload file to storage", {
        code: "FILE_UPLOAD_FAILED",
      });
    }

    const response: RecipesServiceResponseBody["filesFromUnsplashRecipes"][200] =
      recipeFileToApiRecipeFile(insertOut.result);

    res.status(200).json(response);
  },
);
