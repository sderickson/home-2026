import { createErrorMiddleware, createGlobalMiddleware } from "@saflib/express";
import express from "express";
import { notebookDb } from "@sderickson/notebook-db";
import {
  notebookServiceStorage,
  type NotebookServiceContextOptions,
} from "@sderickson/notebook-service-common";

// BEGIN SORTED WORKFLOW AREA router-imports FOR express/add-handler

// END WORKFLOW AREA

/**
 * Creates the HTTP server for the notebook service.
 */
export function createNotebookHttpApp(
  options: NotebookServiceContextOptions,
) {
  let dbKey = options.notebookDbKey;
  if (!dbKey) {
    dbKey = notebookDb.connect();
  }

  const app = express();
  app.use(createGlobalMiddleware());
  app.set("trust proxy", 1);

  const context = { notebookDbKey: dbKey };
  app.use((_req, _res, next) => {
    notebookServiceStorage.run(context, () => {
      next();
    });
  });

  // BEGIN WORKFLOW AREA app-use-routes FOR express/add-handler

  // END WORKFLOW AREA

  app.use(createErrorMiddleware());

  return app;
}
