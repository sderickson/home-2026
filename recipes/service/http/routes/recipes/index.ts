import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createRecipeHandler } from "./create.ts";
import { getRecipeHandler } from "./get.ts";
import { listRecipesHandler } from "./list.ts";
import { updateRecipeHandler } from "./update.ts";
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
  router.put("/recipes/:id", updateRecipeHandler);
  router.put("/recipes/:id/versions/latest", versionsLatestUpdateRecipesHandler);

  return router;
};
