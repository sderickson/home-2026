import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { listCollectionsHandler } from "./list.ts";
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

  return router;
};
