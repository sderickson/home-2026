import express, { type IRouter } from "express";
import { createOperationScopedMiddleware } from "@saflib/express";
import { operationJsonSpec as sharedGetMenusOperationJsonSpec } from "@sderickson/recipes-spec/operations/sharedGetMenus";

// BEGIN WORKFLOW AREA handler-imports FOR express/add-handler
import { sharedGetMenusHandler } from "./shared-get.ts";
// END WORKFLOW AREA

/**
 * Public share routes for menus. Each route uses its own operation OpenAPI
 * fragment — do not mount full `jsonSpec` on a shared prefix.
 * Authenticated menu CRUD stays under `routes/menus/`.
 */
export function createMenusShareRouter(): IRouter {
  const router = express.Router();

  // BEGIN WORKFLOW AREA route-registrations FOR express/add-handler
  router.get(
    "/menus/:id/shared",
    ...createOperationScopedMiddleware(sharedGetMenusOperationJsonSpec),
    sharedGetMenusHandler,
  );
  // END WORKFLOW AREA

  return router;
}
