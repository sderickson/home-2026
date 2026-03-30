import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createMenuHandler } from "./create.ts";
import { deleteMenuHandler } from "./delete.ts";
import { getMenuHandler } from "./get.ts";
import { listMenusHandler } from "./list.ts";
import { updateMenuHandler } from "./update.ts";
// END WORKFLOW AREA

export const createMenusRouter = () => {
  const router = express.Router();

  router.use(
    "/menus",
    createScopedMiddleware({
      apiSpec: jsonSpec,
      enforceAuth: false,
      emailVerificationRequired: false,
    }),
  );
  router.get("/menus", listMenusHandler);
  router.post("/menus", createMenuHandler);
  router.get("/menus/:id", getMenuHandler);
  router.put("/menus/:id", updateMenuHandler);
  router.delete("/menus/:id", deleteMenuHandler);

  return router;
};
