import { createErrorMiddleware, createGlobalMiddleware } from "@saflib/express";
import express from "express";
import { createObjectStore } from "@saflib/object-store";
import { recipesDb } from "@sderickson/recipes-db";
import {
  recipesServiceStorage,
  type RecipesServiceContextOptions,
} from "@sderickson/recipes-service-common";

// BEGIN SORTED WORKFLOW AREA router-imports FOR express/add-handler
import { createRecipesRouter } from "./routes/recipes/index.ts";
// END WORKFLOW AREA

/**
 * Creates the HTTP server for the recipes service.
 */
export function createRecipesHttpApp(
  options: RecipesServiceContextOptions,
) {
  let dbKey = options.recipesDbKey;
  if (!dbKey) {
    dbKey = recipesDb.connect();
  }
  const recipesFileContainer =
    options.recipesFileContainer ?? createObjectStore({ type: "test" });

  const app = express();
  app.use(createGlobalMiddleware());
  app.set("trust proxy", 1);

  const context = { recipesDbKey: dbKey, recipesFileContainer };
  app.use((_req, _res, next) => {
    recipesServiceStorage.run(context, () => {
      next();
    });
  });

  // BEGIN WORKFLOW AREA app-use-routes FOR express/add-handler

  app.use(createRecipesRouter());
  // END WORKFLOW AREA

  app.use(createErrorMiddleware());

  return app;
}
