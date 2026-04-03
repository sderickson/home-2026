import { startExpressServer } from "@saflib/express";
import { createRecipesHttpApp } from "@sderickson/recipes-http";
import { recipesDb } from "@sderickson/recipes-db";
import { makeSubsystemReporters } from "@saflib/node";
import { typedEnv } from "./env.ts";
import { initializeDependencies } from "@sderickson/recipes-service-common";

export async function startRecipesService() {
  const { log, logError } = makeSubsystemReporters("init", "main");
  try {
    log.info("Starting up recipes service...");

    log.info("Initializing dependencies...");
    await initializeDependencies();
    log.info("Dependencies initialized.");

    log.info("Connecting to recipes-db...");
    const dbKey = recipesDb.connect({ onDisk: true });
    log.info("recipes-db connection complete.");

    log.info("Starting recipes-http...");
    const expressApp = createRecipesHttpApp({ recipesDbKey: dbKey });
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
