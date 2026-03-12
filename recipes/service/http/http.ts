import { createErrorMiddleware, createGlobalMiddleware } from "@saflib/express";
import express from "express";
import {
  makeContext,
  recipesServiceStorage,
  type RecipesServiceContextOptions,
} from "@sderickson/recipes-service-common";

// BEGIN SORTED WORKFLOW AREA router-imports FOR express/add-handler
import { createRecipesRouter } from "./routes/recipes/index.ts";
import { createUnsplashPhotosRouter } from "./routes/unsplash-photos/index.ts";
// END WORKFLOW AREA

/**
 * Creates the HTTP server for the recipes service.
 */
export function createRecipesHttpApp(options: RecipesServiceContextOptions = {}) {
  const context = makeContext(options);

  const app = express();
  app.use(
    createGlobalMiddleware({
      disableCors: true,
    }),
  );
  app.set("trust proxy", 1);

  app.use((_req, _res, next) => {
    recipesServiceStorage.run(context, () => {
      next();
    });
  });

  // BEGIN WORKFLOW AREA app-use-routes FOR express/add-handler

  app.use(createRecipesRouter());
  app.use(createUnsplashPhotosRouter());
  // END WORKFLOW AREA

  app.use(createErrorMiddleware());

  return app;
}
