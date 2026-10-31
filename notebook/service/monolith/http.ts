import type { NotebookServiceContextOptions } from "@sderickson/notebook-service-common/context";
import {
  buildNotebookHttpApp,
  type NotebookHttpAppLease,
  type HttpRouterMount,
} from "@sderickson/notebook-http-app";
import { createNotebookRouter } from "@sderickson/notebook-http/http";
import { isPublicMonolithRoute } from "./is-public-monolith-route.ts";

// BEGIN WORKFLOW AREA offshoot-router-imports FOR express/init

// END WORKFLOW AREA

/**
 * Every product router: the notebook feature's, then each offshoot's barrel router
 * (added by `express/init`). Feature http packages never mount each other; the
 * composition root does.
 */
export function productionMounts(): HttpRouterMount[] {
  return [
    { kind: "router", createRouter: createNotebookRouter },
    // BEGIN WORKFLOW AREA offshoot-router-mounts FOR express/init

    // END WORKFLOW AREA
  ];
}

/** Creates the full production HTTP server for the notebook service. */
export function createNotebookHttpApp(
  options: NotebookServiceContextOptions = {},
): NotebookHttpAppLease {
  return buildNotebookHttpApp({
    ...options,
    mounts: productionMounts(),
    isPublicRoute: isPublicMonolithRoute,
  });
}
