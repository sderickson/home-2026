import express, { type IRouter } from "express";
import { createOperationScopedMiddleware, createScopedMiddleware } from "@saflib/express";
import { jsonSpec } from "@sderickson/recipes-spec";
import { operationJsonSpec as sharedGetMenusOperationJsonSpec } from "@sderickson/recipes-spec/operations/sharedGetMenus";

// BEGIN WORKFLOW AREA handler-imports FOR express/add-handler
import { sharedGetMenusHandler } from "./shared-get.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA handler-imports FOR express/add-handler
import { createMenuHandler } from "./create.ts";
import { deleteMenuHandler } from "./delete.ts";
import { getMenuHandler } from "./get.ts";
import { listMenusHandler } from "./list.ts";
import { updateMenuHandler } from "./update.ts";
// END WORKFLOW AREA

/**
 * Public share routes for menus. Each route uses its own operation OpenAPI
 * fragment — do not mount full `jsonSpec` on a shared prefix.
 */
export function createMenusShareRouter(): IRouter {
  const router = express.Router();

  // BEGIN WORKFLOW AREA route-registrations FOR express/add-handler
  router.get(
    "/menus/:id/shared",
    ...createOperationScopedMiddleware(sharedGetMenusOperationJsonSpec, {
      enforceAuth: false,
    }),
    sharedGetMenusHandler,
  );
  // END WORKFLOW AREA

  return router;
}

export const createMenusRouter = () => {
  const router = express.Router();

  router.use(
    "/menus",
    createScopedMiddleware({
      apiSpec: jsonSpec,
      enforceAuth: true,
      emailVerificationRequired: true,
    }),
  );
  router.get("/menus", listMenusHandler);
  router.post("/menus", createMenuHandler);
  router.get("/menus/:id", getMenuHandler);
  router.put("/menus/:id", updateMenuHandler);
  router.delete("/menus/:id", deleteMenuHandler);

  return router;
};
