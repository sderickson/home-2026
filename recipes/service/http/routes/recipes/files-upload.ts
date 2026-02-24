import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import { Readable } from "stream";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  recipeQueries,
  recipeFileQueries,
  RecipeNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { recipeFileToApiRecipeFile } from "./_helpers.ts";

type FilesUploadRecipeError = RecipeNotFoundError;

export const filesUploadRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    if (!auth.userScopes.includes("*")) {
      throw createError(403, "Forbidden", { code: "FORBIDDEN" });
    }

    const id = req.params.id as string;
    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;
    const userId = auth.userId;

    const files = Array.isArray(req.files) ? req.files : req.files?.file;
    const file = Array.isArray(files)
      ? files.find((f: { fieldname: string }) => f.fieldname === "file") ??
        files[0]
      : files;
    if (!file || !("path" in file) || typeof file.path !== "string") {
      throw createError(400, "No file uploaded");
    }
    const multerFile = file as { path: string; originalname: string; mimetype: string; size: number };

    const getOut = await recipeQueries.getByIdRecipe(recipesDbKey, id);
    if (getOut.error) {
      const error: FilesUploadRecipeError = getOut.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }

    const pathUuid = crypto.randomUUID();
    const blob_name = `recipes/${id}/${pathUuid}`;

    const insertOut = await recipeFileQueries.insertRecipeFile(recipesDbKey, {
      recipe_id: id,
      blob_name,
      file_original_name: multerFile.originalname,
      mimetype: multerFile.mimetype || "application/octet-stream",
      size: multerFile.size,
      uploaded_by: userId,
    });

    if (insertOut.error) {
      const error: FilesUploadRecipeError = insertOut.error;
      switch (true) {
        case error instanceof RecipeNotFoundError:
          throw createError(404, error.message, { code: "RECIPE_NOT_FOUND" });
        default:
          throw error satisfies never;
      }
    }

    const stream: Readable = createReadStream(multerFile.path);
    const uploadResult = await recipesFileContainer.uploadFile(
      blob_name,
      stream,
      {
        mimetype: multerFile.mimetype || "application/octet-stream",
        filename: multerFile.originalname,
      },
    );

    try {
      await unlink(multerFile.path);
    } catch {
      // ignore cleanup errors
    }

    if (uploadResult.error) {
      await recipeFileQueries.deleteRecipeFile(recipesDbKey, insertOut.result.id);
      throw createError(500, "Failed to upload file to storage", {
        code: "FILE_UPLOAD_FAILED",
      });
    }

    const response: RecipesServiceResponseBody["filesUploadRecipes"][200] =
      recipeFileToApiRecipeFile(insertOut.result);

    res.status(200).json(response);
  },
);
