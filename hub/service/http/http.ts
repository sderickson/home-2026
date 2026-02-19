import { createErrorMiddleware, createGlobalMiddleware } from "@saflib/express";
import express from "express";
import { hubDb } from "@sderickson/hub-db";
import {
  hubServiceStorage,
  type HubServiceContextOptions,
} from "@sderickson/hub-service-common";

// BEGIN SORTED WORKFLOW AREA router-imports FOR express/add-handler

// END WORKFLOW AREA

/**
 * Creates the HTTP server for the hub service.
 */
export function createHubHttpApp(
  options: HubServiceContextOptions,
) {
  let dbKey = options.hubDbKey;
  if (!dbKey) {
    dbKey = hubDb.connect();
  }

  const app = express();
  app.use(createGlobalMiddleware());
  app.set("trust proxy", 1);

  const context = { hubDbKey: dbKey };
  app.use((_req, _res, next) => {
    hubServiceStorage.run(context, () => {
      next();
    });
  });

  // BEGIN WORKFLOW AREA app-use-routes FOR express/add-handler

  // END WORKFLOW AREA

  app.use(createErrorMiddleware());

  return app;
}
