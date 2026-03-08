import createError from "http-errors";
import { createHandler } from "@saflib/express";
import {
  FileNotFoundError,
  PathTraversalError,
  StorageError,
} from "@saflib/object-store";
import { getSafContext } from "@saflib/node";
import {
  recipeQueries,
  recipeNoteFileQueries,
  RecipeNotFoundError,
  RecipeNoteNotFoundError,
} from "@sderickson/recipes-db";
import { recipesServiceStorage } from "@sderickson/recipes-service-common";

export const notesFilesDownloadRecipesHandler = createHandler(
  async (req, res) => {
    const store = getSafContext();
    const { recipesDbKey, recipesFileContainer } =
      recipesServiceStorage.getStore()!;

    const id = req.params.id as string;
    const noteId = req.params.noteId as string;
    const fileId = req.params.fileId as string;

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

    const listOut = await recipeNoteFileQueries.listRecipeNoteFile(
      recipesDbKey,
      { recipeId: id, noteId },
    );

    if (listOut.error) {
      const error = listOut.error;
      switch (true) {
        case error instanceof RecipeNoteNotFoundError:
          throw createError(404, error.message, {
            code: "RECIPE_NOTE_NOT_FOUND",
          });
        default:
          throw error satisfies never;
      }
    }

    const file = listOut.result.find((f) => f.id === fileId);
    if (!file) {
      throw createError(404, "Recipe note file not found", {
        code: "RECIPE_NOTE_FILE_NOT_FOUND",
      });
    }

    const readOut = await recipesFileContainer.readFile(file.blob_name);
    if (readOut.error) {
      const err: FileNotFoundError | PathTraversalError | StorageError =
        readOut.error;
      switch (true) {
        case err instanceof FileNotFoundError:
          throw createError(404, err.message, {
            code: "RECIPE_NOTE_FILE_NOT_FOUND",
          });
        case err instanceof PathTraversalError:
          throw createError(400, err.message, { code: "BAD_REQUEST" });
        case err instanceof StorageError:
          if (err.cause instanceof PathTraversalError) {
            throw createError(400, err.cause.message, { code: "BAD_REQUEST" });
          }
          throw createError(500, "Failed to read file", {
            code: "STORAGE_ERROR",
          });
        default:
          throw err satisfies never;
      }
    }

    const mimetype = file.mimetype || "application/octet-stream";
    const filename = file.file_original_name;

    res.status(200);
    res.setHeader("Content-Type", mimetype);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${filename.replace(/"/g, '\\"')}"`,
    );
    readOut.result.pipe(res);
  },
);
