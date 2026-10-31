import { startExpressServer } from "@saflib/express";
import { createJobsApp, makeCronEnqueuer } from "@saflib/jobs-http";
import { makeSubsystemReporters } from "@saflib/node";
import { runRecipesCron } from "@sderickson/recipes-cron";
import { fixTextTimestamps, recipesDb } from "@sderickson/recipes-db";
import {
  getRecipesJobsDbKey,
  recipesJobOperations,
  recipesTriggerMap,
  runRecipesJobs,
} from "@sderickson/recipes-jobs";
import { makeContext } from "@sderickson/recipes-service-common";
import { jsonSpec } from "@sderickson/recipes-spec";
import { backfillUnsplashHotlinks } from "./backfill-unsplash-hotlinks.ts";
import { cleanupUnsplashCopies } from "./cleanup-unsplash-copies.ts";
import { initializeDependencies } from "./dependencies.ts";
import { typedEnv } from "./env.ts";
import { createRecipesHttpApp } from "./http.ts";

export { initializeDependencies };

export async function startRecipesService() {
  const { log, logError } = makeSubsystemReporters("init", "main");
  try {
    log.info("Starting up recipes service...");

    log.info("Initializing dependencies...");
    await initializeDependencies();
    log.info("Dependencies initialized.");

    log.info("Connecting to recipes-db...");
    const dbKey = recipesDb.connect({ onDisk: true });
    const context = makeContext({ recipesDbKey: dbKey });
    log.info("recipes-db connection complete.");

    log.info("Repairing legacy recipes-db timestamps...");
    const { tables } = fixTextTimestamps(dbKey);
    for (const [table, changes] of Object.entries(tables)) {
      if (changes > 0) {
        log.info(
          `Converted ${changes} ${table} row(s) from ISO text timestamps to unix seconds.`,
        );
      }
    }
    log.info("recipes-db timestamp repair complete.");

    // Not awaited: calls Unsplash per row, and must not hold up startup.
    void (async () => {
      const backfill = await backfillUnsplashHotlinks(dbKey);
      console.log(
        `[recipes] Unsplash hotlink backfill: ${backfill.updated} updated, ${backfill.skipped} skipped.`,
      );
      if (backfill.stoppedOn) {
        console.warn(
          `[recipes] Unsplash hotlink backfill stopped early; will retry next startup: ${backfill.stoppedOn.message}`,
        );
      }

      const cleanup = await cleanupUnsplashCopies(
        dbKey,
        context.recipesFileContainer,
      );
      console.log(
        `[recipes] Deleted ${cleanup.deleted} stored Unsplash image copies (now hotlinked).`,
      );
      if (cleanup.stoppedOn) {
        console.warn(
          `[recipes] Unsplash copy cleanup stopped early; will retry next startup: ${cleanup.stoppedOn.message}`,
        );
      }
    })().catch((err) => {
      console.error("[recipes] Unsplash backfill/cleanup failed:", err);
      logError(err);
    });

    const jobsSocketPath =
      (
        typedEnv as {
          RECIPES_SERVICE_JOBS_SOCKET?: string;
        }
      ).RECIPES_SERVICE_JOBS_SOCKET ?? "/tmp/recipes-jobs-internal.sock";
    const internalSocketPath =
      (
        typedEnv as {
          RECIPES_SERVICE_INTERNAL_SOCKET?: string;
        }
      ).RECIPES_SERVICE_INTERNAL_SOCKET ?? "/tmp/recipes-internal.sock";

    log.info("Starting recipes-cron...");
    await runRecipesCron(context, makeCronEnqueuer({ jobsSocketPath }));
    log.info("recipes-cron startup complete.");

    log.info("Starting recipes-jobs runtime...");
    await runRecipesJobs(context, jsonSpec);
    log.info("recipes-jobs runtime startup complete.");

    log.info("Starting recipes-jobs app...");
    const jobsApp = createJobsApp({
      triggerMap: recipesTriggerMap,
      operationConfig: recipesJobOperations,
      apiSpec: jsonSpec,
      targetSocketPath: internalSocketPath,
      dbKey: getRecipesJobsDbKey(),
    });
    startExpressServer(jobsApp, { socketPath: jobsSocketPath });
    log.info("recipes-jobs app listening on " + jobsSocketPath);

    log.info("Starting recipes-http...");
    const { app: expressApp } = createRecipesHttpApp(context);
    startExpressServer(expressApp, {
      port: parseInt(
        typedEnv.RECIPES_SERVICE_HTTP_HOST.split(":")[1] || "3000",
        10,
      ),
      socketPath: internalSocketPath,
    });
    log.info("recipes-http startup complete.");
  } catch (error) {
    logError(error);
  }
}
