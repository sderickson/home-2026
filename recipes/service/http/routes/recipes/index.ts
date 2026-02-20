import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createRecipeHandler } from "./create.ts";
import { deleteRecipeHandler } from "./delete.ts";
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
      authRequired: true,
    }),
  );
  router.get("/recipes", listRecipesHandler);
  router.post("/recipes", createRecipeHandler);
  router.get("/recipes/:id", getRecipeHandler);
  router.get("/recipes/:id/versions", versionsListRecipesHandler);
  router.post("/recipes/:id/versions", versionsCreateRecipesHandler);
  router.put("/recipes/:id", updateRecipeHandler);
  router.delete("/recipes/:id", deleteRecipeHandler);
  router.put("/recipes/:id/versions/latest", versionsLatestUpdateRecipesHandler);

  return router;
};
