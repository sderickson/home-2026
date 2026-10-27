import { createDevAnalyticsRouter } from "@saflib/analytics-http";
import { createCronRouter } from "@saflib/cron-http";
import type { DbKey } from "@saflib/drizzle";
import { isDevelopmentDeployment } from "@saflib/env";
import { createDevErrorsRouter, createErrorsRouter } from "@saflib/errors-http";
import { createProductHttpApp, type HttpRouterMount } from "@saflib/express";
import { createJobsRouter } from "@saflib/jobs-http";
import { createDevLogsRouter } from "@saflib/node-log-http";
import { createMetricsRouter } from "@saflib/node-metrics-http";
import type express from "express";
import type { Request } from "express";
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

export type { HttpRouterMount } from "@saflib/express";

export type BuildRecipesHttpAppOptions = RecipesServiceContextOptions & {
  /**
   * Feature routers. The composition root (`@sderickson/recipes-service`)
   * passes every one; route tests pass the routers they exercise.
   */
  mounts: HttpRouterMount[];
  /**
   * Requests that skip the session gate. The composition root passes the
   * reviewed public-route list; route tests derive it from `x-public`
   * (`publicRouteMatcher`).
   */
  isPublicRoute: (req: Request) => boolean;
};

export type RecipesHttpAppLease = {
  app: express.Express;
  recipesDbKey: DbKey;
};

/**
 * The recipes service's HTTP app: `createProductHttpApp` with the recipes
 * service context, error reporting (and dev observability) before the auth
 * gate, and the jobs and cron routers after the feature routers.
 */
export function buildRecipesHttpApp(
  options: BuildRecipesHttpAppOptions,
): RecipesHttpAppLease {
  const { mounts, isPublicRoute, ...contextOptions } = options;
  const context = makeContext(contextOptions);

  const app = createProductHttpApp({
    globalMiddleware: { disableCors: true },
    runInContext: (next) => recipesServiceStorage.run(context, next),
    publicRouters: [
      // Always-on error chrome (CSP ingest + admin test-error).
      createErrorsRouter(),
      // Development-only observability routes (DEPLOYMENT_NAME=development).
      ...(isDevelopmentDeployment()
        ? [
            createDevErrorsRouter(),
            createDevLogsRouter(),
            createDevAnalyticsRouter(),
            createMetricsRouter(),
          ]
        : []),
    ],
    isPublicRoute,
    mounts,
    platformRouters: [
      createJobsRouter({ dbKey: getRecipesJobsDbKey() }),
      createCronRouter({
        dbKey: getRecipesCronDbKey(),
        jobs: recipesCronJobs,
        // Ticks enqueue via runRecipesCron in the service; the router is admin-only.
        enqueueJob: async () => ({}),
      }),
    ],
  });

  return { app, recipesDbKey: context.recipesDbKey };
}
