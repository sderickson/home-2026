import { createDevAnalyticsRouter } from "@saflib/analytics-http";
import { createCronRouter } from "@saflib/cron-http";
import { isDevelopmentDeployment } from "@saflib/env";
import { createDevErrorsRouter, createErrorsRouter } from "@saflib/errors-http";
import { createErrorMiddleware, createGlobalMiddleware } from "@saflib/express";
import { createJobsRouter } from "@saflib/jobs-http";
import { createDevLogsRouter } from "@saflib/node-log-http";
import { createMetricsRouter } from "@saflib/node-metrics-http";
import express from "express";
import {
  getRecipesCronDbKey,
  recipesCronJobs,
} from "@sderickson/recipes-cron";
import { getRecipesJobsDbKey } from "@sderickson/recipes-jobs";
import {
  makeContext,
  recipesServiceStorage,
  type RecipesServiceContextOptions,
} from "@sderickson/recipes-service-common";
import { createAdminRouter } from "./routes/admin/index.ts";

// BEGIN SORTED WORKFLOW AREA router-imports FOR express/add-handler
import { createCollectionsRouter } from "./routes/collections/index.ts";
import { createMenusRouter } from "./routes/menus/index.ts";
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

  // Always-on error chrome (CSP ingest + admin test-error).
  app.use(createErrorsRouter());

  // Development-only observability routes (gated on DEPLOYMENT_NAME=development).
  if (isDevelopmentDeployment()) {
    app.use(createDevErrorsRouter());
    app.use(createDevLogsRouter());
    app.use(createDevAnalyticsRouter());
    app.use(createMetricsRouter());
  }

  app.use(createAdminRouter());

  // BEGIN WORKFLOW AREA app-use-routes FOR express/add-handler

  app.use(createRecipesRouter());
  app.use(createUnsplashPhotosRouter());
  app.use(createCollectionsRouter());
  app.use(createMenusRouter());
  // END WORKFLOW AREA

  // Platform terminators after product mounts (cron ends with catch-all 404).
  app.use(
    createJobsRouter({
      dbKey: getRecipesJobsDbKey(),
    }),
  );

  app.use(
    createCronRouter({
      dbKey: getRecipesCronDbKey(),
      jobs: recipesCronJobs,
      // Ticks enqueue via runRecipesCron in the service; router is admin-only.
      enqueueJob: async () => ({}),
    }),
  );

  app.use(createErrorMiddleware());

  return app;
}
