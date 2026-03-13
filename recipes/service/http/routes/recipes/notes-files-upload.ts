import { createReadStream } from "fs";
import { unlink } from "fs/promises";
import createError from "http-errors";
import { createHandler } from "@saflib/express";
import { getSafContextWithAuth } from "@saflib/node";
import { Readable } from "stream";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import {
  generateShortId,
  recipeNoteFileQueries,
  RecipeNoteNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";
import { getRecipeAndRequireCollectionAuth } from "./_collection-auth.ts";
import { insertNoteFileResultToNotesFilesUploadRecipesResponse } from "./_helpers.ts";

type NotesFilesUploadRecipeError = RecipeNoteNotFoundError;

export const notesFilesUploadRecipesHandler = createHandler(
  async (req, res) => {
    const { auth } = getSafContextWithAuth();
    const id = req.params.id as string;
    const noteId = req.params.noteId as string;
    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;
    const userId = auth.userId;
    await getRecipeAndRequireCollectionAuth(id, { requireMutate: true });

    const files = Array.isArray(req.files) ? req.files : req.files?.file;
    const file = Array.isArray(files)
      ? files.find((f: { fieldname: string }) => f.fieldname === "file") ??
        files[0]
      : files;
    if (!file || !("path" in file) || typeof file.path !== "string") {
      throw createError(400, "No file uploaded");
    }
    const multerFile = file as {
      path: string;
      originalname: string;
      mimetype: string;
      size: number;
    };

    const pathId = generateShortId();
    const blob_name = `notes/${noteId}/${pathId}`;

    const insertOut = await recipeNoteFileQueries.insertRecipeNoteFile(
      recipesDbKey,
      {
        recipeId: id,
        recipe_note_id: noteId,
        blob_name,
        file_original_name: multerFile.originalname,
        mimetype: multerFile.mimetype || "application/octet-stream",
        size: multerFile.size,
        uploaded_by: userId,
      },
    );

    if (insertOut.error) {
      const error: NotesFilesUploadRecipeError = insertOut.error;
      switch (true) {
        case error instanceof RecipeNoteNotFoundError:
          throw createError(404, error.message, {
            code: "RECIPE_NOTE_NOT_FOUND",
          });
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
      await recipeNoteFileQueries.deleteRecipeNoteFile(
        recipesDbKey,
        insertOut.result.id,
      );
      throw createError(500, "Failed to upload file to storage", {
        code: "FILE_UPLOAD_FAILED",
      });
    }

    const response: RecipesServiceResponseBody["notesFilesUploadRecipes"][200] =
      insertNoteFileResultToNotesFilesUploadRecipesResponse(insertOut.result, id);

    res.status(200).json(response);
  },
);
