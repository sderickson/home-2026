import express from "express";
import { createScopedMiddleware, uploadToDiskOptions } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createRecipeHandler } from "./create.ts";
import { deleteRecipeHandler } from "./delete.ts";
import { filesDeleteRecipesHandler } from "./files-delete.ts";
import { filesDownloadRecipesHandler } from "./files-download.ts";
import { filesListRecipesHandler } from "./files-list.ts";
import { filesFromUnsplashRecipesHandler } from "./files-from-unsplash.ts";
import { filesUploadRecipesHandler } from "./files-upload.ts";
import { getRecipeHandler } from "./get.ts";
import { listRecipesHandler } from "./list.ts";
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
      emailVerificationRequired: true,
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
