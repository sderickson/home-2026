import { createErrorMiddleware, createGlobalMiddleware } from "@saflib/express";
import express from "express";
import { hubDb } from "@sderickson/hub-db";
import { hubDbManager } from "@sderickson/hub-db/instances";
import { createHubOpsRouter } from "@sderickson/hub-ops";
import { probeCheck } from "@saflib/ops-http";
import {
  hubServiceStorage,
  type HubServiceContextOptions,
} from "@sderickson/hub-service-common";

// BEGIN SORTED WORKFLOW AREA router-imports FOR express/add-handler

// END WORKFLOW AREA

/**
 * Creates the HTTP server for the hub service.
 */
export function createHubHttpApp(options: HubServiceContextOptions) {
  let dbKey = options.hubDbKey;
  if (!dbKey) {
    dbKey = hubDb.connect();
  }

  const app = express();
  app.use(
    createGlobalMiddleware({
      disableCors: true,
    }),
  );
  app.set("trust proxy", 1);

  const context = { hubDbKey: dbKey };
  app.use((_req, _res, next) => {
    hubServiceStorage.run(context, () => {
      next();
    });
  });

  // BEGIN WORKFLOW AREA app-use-routes FOR express/add-handler

  // END WORKFLOW AREA

  // Ops API (/ops/*, by ops token) and token admin (/admin/ops-tokens).
  // The hub has no global session gate, so nothing needs deferring.
  app.use(
    createHubOpsRouter({
      healthChecks: [
        probeCheck("hub-db", async () => {
          hubDbManager.get(dbKey)!.$client.prepare("select 1").get();
        }),
      ],
    }),
  );

  app.use(createErrorMiddleware());

  return app;
}
