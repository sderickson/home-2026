import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createRecipeHandler } from "./create.ts";
import { getRecipeHandler } from "./get.ts";
import { listRecipesHandler } from "./list.ts";
import { updateRecipeHandler } from "./update.ts";
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
  router.put("/recipes/:id", updateRecipeHandler);

  return router;
};
