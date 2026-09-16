import { cronDb } from "@saflib/cron-db";
import { runCron, type CronEnqueuer, type JobsMap } from "@saflib/cron-http";
import { createOnDiskDbKeyAccessor } from "@saflib/drizzle";
import {
  recipesServiceStorage,
  type RecipesServiceContext,
} from "@sderickson/recipes-service-common";
// BEGIN WORKFLOW AREA job-imports FOR cron/add-job
// END WORKFLOW AREA

export const recipesCronJobs: JobsMap = {
  // BEGIN WORKFLOW AREA job-map FOR cron/add-job
  // END WORKFLOW AREA
};

const cronDbAccessor = createOnDiskDbKeyAccessor({
  packageUrl: import.meta.url,
  filePrefix: "cron-db",
  connect: cronDb.connect,
});

/**
 * Opaque key for `@saflib/cron-db` (not the main app DB key). Use this for
 * `createCronRouter` and `runCron`.
 */
export const getRecipesCronDbKey = cronDbAccessor.getDbKey;

export const runRecipesCron = (
  context: RecipesServiceContext,
  enqueueJob: CronEnqueuer,
) => {
  return recipesServiceStorage.run(context, () =>
    runCron({
      jobs: recipesCronJobs,
      dbKey: getRecipesCronDbKey(),
      enqueueJob,
    }),
  );
};
