import { startExpressServer } from "@saflib/express";
import { createNotebookHttpApp } from "@sderickson/notebook-http";
import { notebookDb } from "@sderickson/notebook-db";
import { makeSubsystemReporters } from "@saflib/node";
import { typedEnv } from "./env.ts";
import { makeContext } from "@sderickson/notebook-service-common";

export function startNotebookService() {
  const { log, logError } = makeSubsystemReporters("init", "main");
  try {
    log.info("Starting up notebook service...");
    log.info("Connecting to notebook-db...");
    const dbKey = notebookDb.connect({ onDisk: true });
    const context = makeContext({ notebookDbKey: dbKey });
    log.info("notebook-db connection complete.");

    log.info("Starting notebook-http...");
    const expressApp = createNotebookHttpApp(context);
    startExpressServer(expressApp, {
      port: parseInt(
        typedEnv.NOTEBOOK_SERVICE_HTTP_HOST.split(":")[1] || "3000",
        10,
      ),
    });
    log.info("notebook-http startup complete.");
  } catch (error) {
    logError(error);
  }
}
