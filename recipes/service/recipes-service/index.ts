import { startExpressServer } from "@saflib/express";
import { createRecipesHttpApp } from "@sderickson/recipes-http";
import { recipesDb } from "@sderickson/recipes-db";
import { makeSubsystemReporters } from "@saflib/node";
import { typedEnv } from "./env.ts";
import { makeContext } from "@sderickson/recipes-service-common";

export function startRecipesService() {
  const { log, logError } = makeSubsystemReporters("init", "main");
  try {
    log.info("Starting up recipes service...");
    log.info("Connecting to recipes-db...");
    const dbKey = recipesDb.connect({ onDisk: true });
    const context = makeContext({ recipesDbKey: dbKey });
    log.info("recipes-db connection complete.");

    log.info("Starting recipes-http...");
    const expressApp = createRecipesHttpApp(context);
    startExpressServer(expressApp, {
      port: parseInt(
        typedEnv.RECIPES_SERVICE_HTTP_HOST.split(":")[1] || "3000",
        10,
      ),
    });
    log.info("recipes-http startup complete.");
  } catch (error) {
    logError(error);
  }
}
