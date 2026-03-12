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
  recipeQueries,
  recipeFileQueries,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { unsplash } from "@sderickson/recipes-unsplash";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { recipeFileToApiRecipeFile } from "./_helpers.ts";

type FilesFromUnsplashRecipeError = RecipeNotFoundError;

export const filesFromUnsplashRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const id = req.params.id as string;
    const body =
      req.body as RecipesServiceRequestBody["filesFromUnsplashRecipes"];
    const { unsplashPhotoId, downloadLocation, imageUrl } = body;

    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;

    const getOut = await recipeQueries.getByIdRecipe(recipesDbKey, id);
    if (getOut.error) {
      const error: FilesFromUnsplashRecipeError = getOut.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }

    const photoResult = await unsplash.photos.get({ photoId: unsplashPhotoId });
    if (photoResult.type !== "success") {
      throw createError(502, "Failed to fetch Unsplash photo", {
        code: "UNSPLASH_ERROR",
      });
    }
    const user = photoResult.response.user as unknown as Record<
      string,
      unknown
    >;

    const trackResult = await unsplash.photos.trackDownload({
      downloadLocation,
    });
    console.log("trackResult", trackResult);
    if (trackResult.type !== "success") {
      throw createError(502, "Failed to track Unsplash download", {
        code: "UNSPLASH_ERROR",
      });
    }

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
