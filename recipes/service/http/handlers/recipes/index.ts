// @ts-nocheck — scaffold placeholders until express/add-handler copies this file.
import express, { type IRouter } from "express";
import {
  createOperationScopedMiddleware,
  uploadToDiskOptions,
} from "@saflib/express";
import { operationJsonSpec as sharedGetRecipesOperationJsonSpec } from "@sderickson/recipes-spec/operations/sharedGetRecipes";

// BEGIN WORKFLOW AREA handler-imports FOR express/add-handler
import { sharedGetRecipesHandler } from "./shared-get.ts";
// END WORKFLOW AREA

/**
 * recipes routes. Each route uses its own operation OpenAPI fragment —
 * do not mount full `jsonSpec` on a shared prefix.
 */
export function createRecipesRouter(): IRouter {
  const router = express.Router();

  // BEGIN WORKFLOW AREA route-registrations FOR express/add-handler
  // TODO: set method and path from openapi/route (match urlPath in the spec).
  router.post(
    "/recipes/shared-get",
    ...createOperationScopedMiddleware(
      sharedGetRecipesOperationJsonSpec,
    ),
    sharedGetRecipesHandler,
  );
  // END WORKFLOW AREA

  return router;
}
