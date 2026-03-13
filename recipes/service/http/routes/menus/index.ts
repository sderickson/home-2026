import express from "express";
import { createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createMenuHandler } from "./create.ts";
import { getMenuHandler } from "./get.ts";
import { listMenusHandler } from "./list.ts";
// END WORKFLOW AREA

export const createMenusRouter = () => {
  const router = express.Router();

  router.use(
    "/menus",
    createScopedMiddleware({
      apiSpec: jsonSpec,
      enforceAuth: false,
    }),
  );
  router.get("/menus", listMenusHandler);
  router.post("/menus", createMenuHandler);
  router.get("/menus/:id", getMenuHandler);

  return router;
};
