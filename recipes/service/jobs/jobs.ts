import { jobsDb } from "@saflib/jobs-db";
import {
  runJobs,
  validateCronTriggerKeys,
  type JobOperationConfigMap,
  type TriggerMap,
} from "@saflib/jobs-http";
import { createOnDiskDbKeyAccessor } from "@saflib/drizzle";
import { typedEnv } from "@saflib/env";
import { jsonSpec } from "@sderickson/recipes-spec";
import {
  recipesServiceStorage,
  type RecipesServiceContext,
} from "@sderickson/recipes-service-common";
import { recipesCronJobs } from "@sderickson/recipes-cron";

/**
 * Reviewed map of which recipes operations may enqueue which operations.
 * Validated against the bundled OpenAPI spec at startup.
 */
export const recipesTriggerMap: TriggerMap = {
  // HTTP/API callers → background targets (jobs/add-job).
  // BEGIN WORKFLOW AREA trigger-map FOR jobs/add-job
  // END WORKFLOW AREA
  // Cron job names → background targets (cron/add-job).
  // BEGIN WORKFLOW AREA cron-trigger-map FOR cron/add-job
  // END WORKFLOW AREA
};

/** Per-target overrides (≤ 120s ceiling). */
export const recipesJobOperations: JobOperationConfigMap = {};

const jobsDbAccessor = createOnDiskDbKeyAccessor({
  packageUrl: import.meta.url,
  filePrefix: "jobs-db",
  connect: jobsDb.connect,
});

/** Opaque key for `@saflib/jobs-db` (separate from the main app DB). */
export const getRecipesJobsDbKey = jobsDbAccessor.getDbKey;

/**
 * Validates `recipesTriggerMap` / `recipesJobOperations` against the recipes
 * OpenAPI spec and `cron:` trigger keys against registered `recipesCronJobs`,
 * then starts the jobs runtime.
 */
export const runRecipesJobs = (context: RecipesServiceContext) => {
  return recipesServiceStorage.run(context, async () => {
    validateCronTriggerKeys(recipesTriggerMap, Object.keys(recipesCronJobs));

    return runJobs({
      triggerMap: recipesTriggerMap,
      operationConfig: recipesJobOperations,
      apiSpec: jsonSpec,
      targetSocketPath:
        (
          typedEnv as {
            RECIPES_SERVICE_INTERNAL_SOCKET?: string;
          }
        ).RECIPES_SERVICE_INTERNAL_SOCKET ?? "/tmp/recipes-internal.sock",
      dbKey: getRecipesJobsDbKey(),
    });
  });
};
