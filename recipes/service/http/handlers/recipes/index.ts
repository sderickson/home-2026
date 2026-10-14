import express, { type IRouter } from "express";
import { createOperationScopedMiddleware } from "@saflib/express";
import { operationJsonSpec as sharedGetRecipesOperationJsonSpec } from "@sderickson/recipes-spec/operations/sharedGetRecipes";

// BEGIN WORKFLOW AREA handler-imports FOR express/add-handler
import { sharedGetRecipesHandler } from "./shared-get.ts";
// END WORKFLOW AREA

/**
 * Public share routes for recipes. Each route uses its own operation OpenAPI
 * fragment — do not mount full `jsonSpec` on a shared prefix.
 * Authenticated recipe CRUD stays under `routes/recipes/`.
 */
export function createRecipesRouter(): IRouter {
  const router = express.Router();

  // BEGIN WORKFLOW AREA route-registrations FOR express/add-handler
  router.get(
    "/recipes/:id/shared",
    ...createOperationScopedMiddleware(sharedGetRecipesOperationJsonSpec, {
      enforceAuth: false,
    }),
    sharedGetRecipesHandler,
  );
  // END WORKFLOW AREA

  return router;
}
