import { cronDb } from "@saflib/cron-db";
import { runCron, type CronEnqueuer, type JobsMap } from "@saflib/cron-http";
import { createOnDiskDbKeyAccessor } from "@saflib/drizzle";
import {
  baseServiceStorage,
  type NotebookServiceContext,
} from "@sderickson/notebook-service-common/context";
import { jobsDemoJobs } from "./jobs/jobs-demo/index.ts";
// BEGIN WORKFLOW AREA job-imports FOR cron/add-job

// END WORKFLOW AREA

export const baseJobs: JobsMap = {
  ...jobsDemoJobs,
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
export const getNotebookCronDbKey = cronDbAccessor.getDbKey;

export const runNotebookCron = (
  context: NotebookServiceContext,
  enqueueJob: CronEnqueuer,
) => {
  return baseServiceStorage.run(context, () =>
    runCron({
      jobs: baseJobs,
      dbKey: getNotebookCronDbKey(),
      enqueueJob,
    }),
  );
};
