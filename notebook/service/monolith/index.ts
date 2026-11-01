import { startExpressServer } from "@saflib/express";
import { createNotebookHttpApp } from "./http.ts";
import { baseDb } from "@sderickson/notebook-db/instances";
import { connectNotebookAuditDb } from "@sderickson/notebook-audit";
import { makeSubsystemReporters } from "@saflib/node";
import { typedEnv } from "./env.ts";
import { makeContext } from "@sderickson/notebook-service-common/context";
import { runNotebookCron } from "@sderickson/notebook-cron";
import {
  baseJobOperations,
  baseTriggerMap,
  getNotebookJobsDbKey,
  runNotebookJobs,
} from "@sderickson/notebook-jobs";
import { createJobsApp, makeCronEnqueuer } from "@saflib/jobs-http";
import { jsonSpec } from "@sderickson/notebook-spec";

export async function startNotebookService() {
  const { log, logError } = makeSubsystemReporters("init", "main");
  try {
    log.info("Starting up notebook service...");
    log.info("Connecting to notebook-db...");
    const dbKey = baseDb.connect({ onDisk: true });
    const context = connectNotebookAuditDb(makeContext({ baseDbKey: dbKey }));
    log.info("notebook-db connection complete.");

    const jobsSocketPath =
      (
        typedEnv as {
          NOTEBOOK_SERVICE_JOBS_SOCKET?: string;
        }
      ).NOTEBOOK_SERVICE_JOBS_SOCKET ?? "/tmp/notebook-jobs-internal.sock";
    const internalSocketPath =
      (
        typedEnv as {
          NOTEBOOK_SERVICE_INTERNAL_SOCKET?: string;
        }
      ).NOTEBOOK_SERVICE_INTERNAL_SOCKET ?? "/tmp/notebook-internal.sock";

    log.info("Starting notebook-cron...");
    await runNotebookCron(context, makeCronEnqueuer({ jobsSocketPath }));
    log.info("notebook-cron startup complete.");

    log.info("Starting notebook-jobs runtime...");
    await runNotebookJobs(context, jsonSpec);
    log.info("notebook-jobs runtime startup complete.");

    log.info("Starting notebook-jobs app...");
    const jobsApp = createJobsApp({
      triggerMap: baseTriggerMap,
      operationConfig: baseJobOperations,
      apiSpec: jsonSpec,
      targetSocketPath: internalSocketPath,
      dbKey: getNotebookJobsDbKey(),
    });
    startExpressServer(jobsApp, { socketPath: jobsSocketPath });
    log.info("notebook-jobs app listening on " + jobsSocketPath);

    log.info("Starting notebook-http...");
    const lease = createNotebookHttpApp(context);
    startExpressServer(lease.app, {
      port: parseInt(
        typedEnv.NOTEBOOK_SERVICE_HTTP_HOST.split(":")[1] || "3000",
        10,
      ),
      socketPath: internalSocketPath,
    });
    log.info("notebook-http startup complete.");
  } catch (error) {
    logError(error);
  }
}
