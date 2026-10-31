import { createProductHttpApp, type HttpRouterMount } from "@saflib/express";
import { isDevelopmentDeployment } from "@saflib/env";
import type express from "express";
import type { Request } from "express";
import type { DbKey } from "@saflib/drizzle";
import { createEmailsRouter } from "@saflib/email-service";
import { createDevErrorsRouter, createErrorsRouter } from "@saflib/errors-http";
import { createDevAnalyticsRouter } from "@saflib/analytics-http";
import { createDevLogsRouter } from "@saflib/node-log-http";
import { resolveEmailServiceFromEnv } from "@saflib/vendors-brevo";
import { baseDb } from "@sderickson/notebook-db/instances";
import {
  baseAuditRecorderMiddleware,
  createNotebookAuditRouter,
} from "@sderickson/notebook-audit";
import {
  baseServiceStorage,
  type NotebookServiceContextOptions,
  makeContext,
} from "@sderickson/notebook-service-common/context";
import { createCronRouter } from "@saflib/cron-http";
import { baseJobs, getNotebookCronDbKey } from "@sderickson/notebook-cron";
import { createJobsRouter } from "@saflib/jobs-http";
import { getNotebookJobsDbKey } from "@sderickson/notebook-jobs";
import { createMetricsRouter } from "@saflib/node-metrics-http";

export type { HttpRouterMount } from "@saflib/express";

export type BuildNotebookHttpAppOptions = NotebookServiceContextOptions & {
  /**
   * Feature routers. The composition root (`service/monolith/http.ts`) passes
   * every one; route tests pass the routers they exercise.
   */
  mounts: HttpRouterMount[];
  /**
   * Requests that skip the session gate. The composition root passes the
   * reviewed public-route list; route tests derive it from `x-public`
   * (`publicRouteMatcher`).
   */
  isPublicRoute: (req: Request) => boolean;
};

export type NotebookHttpAppLease = {
  app: express.Express;
  baseDbKey: DbKey;
};

/**
 * The notebook service's HTTP app: {@link createProductHttpApp} with the notebook
 * service context, audit recorder, and the platform routers (audit, jobs,
 * cron) after the feature routers.
 */
export function buildNotebookHttpApp(
  options: BuildNotebookHttpAppOptions,
): NotebookHttpAppLease {
  const dbKey = options.baseDbKey ?? baseDb.connect();
  const context = makeContext({
    baseDbKey: dbKey,
    ...(options.auditDbKey !== undefined
      ? { auditDbKey: options.auditDbKey }
      : {}),
  });

  const app = createProductHttpApp({
    globalMiddleware: { disableCors: true },
    runInContext: (next) => baseServiceStorage.run(context, next),
    publicRouters: [
      createErrorsRouter(),
      // Development-only observability routes.
      ...(isDevelopmentDeployment()
        ? [
            createDevErrorsRouter(),
            createDevLogsRouter(),
            createDevAnalyticsRouter(),
            createEmailsRouter({ emailService: resolveEmailServiceFromEnv() }),
            createMetricsRouter(),
          ]
        : []),
    ],
    isPublicRoute: options.isPublicRoute,
    afterAuth: [baseAuditRecorderMiddleware()],
    mounts: options.mounts,
    platformRouters: [
      createNotebookAuditRouter(),
      createJobsRouter({ dbKey: getNotebookJobsDbKey() }),
      createCronRouter({
        dbKey: getNotebookCronDbKey(),
        jobs: baseJobs,
        // Ticks enqueue via runNotebookCron in the monolith; the router is admin-only.
        enqueueJob: async () => ({}),
      }),
    ],
  });

  return { app, baseDbKey: dbKey };
}
