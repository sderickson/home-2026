import express from "express";
import { createScopedMiddleware, uploadToDiskOptions } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
// import { notesFilesDeleteRecipesHandler } from "./notes-files-delete.ts";
import { createRecipeHandler } from "./create.ts";
import { deleteRecipeHandler } from "./delete.ts";
import { filesDeleteRecipesHandler } from "./files-delete.ts";
import { filesDownloadRecipesHandler } from "./files-download.ts";
import { filesListRecipesHandler } from "./files-list.ts";
import { filesFromUnsplashRecipesHandler } from "./files-from-unsplash.ts";
import { filesUploadRecipesHandler } from "./files-upload.ts";
import { getRecipeHandler } from "./get.ts";
import { listRecipesHandler } from "./list.ts";
import { notesCreateRecipesHandler } from "./notes-create.ts";
import { notesDeleteRecipesHandler } from "./notes-delete.ts";
import { notesFilesDeleteRecipesHandler } from "./notes-files-delete.ts";
import { notesFilesDownloadRecipesHandler } from "./notes-files-download.ts";
import { notesFilesListRecipesHandler } from "./notes-files-list.ts";
import { notesFilesUploadRecipesHandler } from "./notes-files-upload.ts";
import { notesListRecipesHandler } from "./notes-list.ts";
import { notesUpdateRecipesHandler } from "./notes-update.ts";
import { recipeNoteFilesGetByNoteIdHandler } from "./notes-files-list-by-recipe.ts";
import { updateRecipeHandler } from "./update.ts";
import { versionsCreateRecipesHandler } from "./versions-create.ts";
import { versionsLatestUpdateRecipesHandler } from "./versions-latest-update.ts";
import { versionsListRecipesHandler } from "./versions-list.ts";
// END WORKFLOW AREA

export const createRecipesRouter = () => {
  const router = express.Router();

  router.use(
    "/recipes",
    createScopedMiddleware({
      apiSpec: jsonSpec,
      enforceAuth: true,
      fileUploader: uploadToDiskOptions,
    }),
  );
  router.get("/recipes", listRecipesHandler);
  router.post("/recipes", createRecipeHandler);
  router.get("/recipes/:id", getRecipeHandler);
  router.get("/recipes/:id/files", filesListRecipesHandler);
  router.get("/recipes/:id/files/:fileId/blob", filesDownloadRecipesHandler);
  router.post("/recipes/:id/files", filesUploadRecipesHandler);
  router.post("/recipes/:id/files/from-unsplash", filesFromUnsplashRecipesHandler);
  router.delete("/recipes/:id/files/:fileId", filesDeleteRecipesHandler);
  router.get("/recipes/:id/notes", notesListRecipesHandler);
  router.post("/recipes/:id/notes", notesCreateRecipesHandler);
  router.get("/recipes/:id/note-files", recipeNoteFilesGetByNoteIdHandler);
  router.get("/recipes/:id/notes/:noteId/files", notesFilesListRecipesHandler);
  router.post("/recipes/:id/notes/:noteId/files", notesFilesUploadRecipesHandler);
  router.get(
    "/recipes/:id/notes/:noteId/files/:fileId/blob",
    notesFilesDownloadRecipesHandler,
  );
  router.delete(
    "/recipes/:id/notes/:noteId/files/:fileId",
    notesFilesDeleteRecipesHandler,
  );
  router.put("/recipes/:id/notes/:noteId", notesUpdateRecipesHandler);
  router.delete("/recipes/:id/notes/:noteId", notesDeleteRecipesHandler);
  router.get("/recipes/:id/versions", versionsListRecipesHandler);
  router.post("/recipes/:id/versions", versionsCreateRecipesHandler);
  router.put("/recipes/:id", updateRecipeHandler);
  router.delete("/recipes/:id", deleteRecipeHandler);
  router.put(
    "/recipes/:id/versions/latest",
    versionsLatestUpdateRecipesHandler,
  );

  return router;
};
