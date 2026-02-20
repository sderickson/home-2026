import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { listRecipesHandler } from "./list.ts";
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

  return router;
};
