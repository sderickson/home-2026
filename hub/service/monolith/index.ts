import { startExpressServer } from "@saflib/express";
import { createHubHttpApp } from "@sderickson/hub-http";
import { hubDb } from "@sderickson/hub-db";
import { makeSubsystemReporters } from "@saflib/node";
import { typedEnv } from "./env.ts";
import { makeContext } from "@sderickson/hub-service-common";

export function startHubService() {
  const { log, logError } = makeSubsystemReporters("init", "main");
  try {
    log.info("Starting up hub service...");
    log.info("Connecting to hub-db...");
    const dbKey = hubDb.connect({ onDisk: true });
    const context = makeContext({ hubDbKey: dbKey });
    log.info("hub-db connection complete.");

    log.info("Starting hub-http...");
    const expressApp = createHubHttpApp(context);
    startExpressServer(expressApp, {
      port: parseInt(
        typedEnv.HUB_SERVICE_HTTP_HOST.split(":")[1] || "3000",
        10,
      ),
    });
    log.info("hub-http startup complete.");
  } catch (error) {
    logError(error);
  }
}
