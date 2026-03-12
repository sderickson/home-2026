import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createCollectionsHandler } from "./create.ts";
import { getCollectionsHandler } from "./get.ts";
import { listCollectionsHandler } from "./list.ts";
import { updateCollectionsHandler } from "./update.ts";
// END WORKFLOW AREA

export const createCollectionsRouter = () => {
  const router = express.Router();

  router.use(
    "/collections",
    createScopedMiddleware({
      apiSpec: jsonSpec,
      enforceAuth: true,
    }),
  );
  router.get("/collections", listCollectionsHandler);
  router.post("/collections", createCollectionsHandler);
  router.get("/collections/:id", getCollectionsHandler);
  router.put("/collections/:id", updateCollectionsHandler);

  return router;
};
