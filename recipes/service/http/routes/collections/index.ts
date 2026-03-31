import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createCollectionsHandler } from "./create.ts";
import { deleteCollectionsHandler } from "./delete.ts";
import { getCollectionsHandler } from "./get.ts";
import { listCollectionsHandler } from "./list.ts";
import { membersAddCollectionsHandler } from "./members-add.ts";
import { membersListCollectionsHandler } from "./members-list.ts";
import { membersRemoveCollectionsHandler } from "./members-remove.ts";
import { membersUpdateCollectionsHandler } from "./members-update.ts";
import { updateCollectionsHandler } from "./update.ts";
// END WORKFLOW AREA

export const createCollectionsRouter = () => {
  const router = express.Router();

  router.use(
    "/collections",
    createScopedMiddleware({
      apiSpec: jsonSpec,
      enforceAuth: true,
      emailVerificationRequired: true,
    }),
  );
  router.get("/collections", listCollectionsHandler);
  router.post("/collections", createCollectionsHandler);
  router.get("/collections/:id", getCollectionsHandler);
  router.put("/collections/:id", updateCollectionsHandler);
  router.delete("/collections/:id", deleteCollectionsHandler);
  router.get("/collections/:id/members", membersListCollectionsHandler);
  router.post("/collections/:id/members", membersAddCollectionsHandler);
  router.put("/collections/:id/members/:memberId", membersUpdateCollectionsHandler);
  router.delete("/collections/:id/members/:memberId", membersRemoveCollectionsHandler);

  return router;
};
