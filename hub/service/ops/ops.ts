import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOnDiskDbKeyAccessor } from "@saflib/drizzle";
import { addErrorCollector, addTransport } from "@saflib/node";
import {
  createIssueCollector,
  createRedactionIssueRecorder,
  currentVersion,
  issuesDb,
  startIssueRetention,
} from "@saflib/errors-db";
import { createPersistentLogTransport, logsDb } from "@saflib/node-log-db";
import { opsDb } from "@saflib/ops-db";
import {
  createOpsRouter,
  diskCheck,
  isOpsApiRequest,
  type HealthCheck,
} from "@saflib/ops-http";

export { isOpsApiRequest };

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");

const opsDbAccessor = createOnDiskDbKeyAccessor({
  packageUrl: import.meta.url,
  filePrefix: "ops-db",
  connect: opsDb.connect,
});

/** Opaque key for `@saflib/ops-db` (ops tokens), separate from the main app DB. */
export const getHubOpsDbKey = opsDbAccessor.getDbKey;

const logsDbAccessor = createOnDiskDbKeyAccessor({
  packageUrl: import.meta.url,
  filePrefix: "logs-db",
  connect: logsDb.connect,
});

/** Opaque key for `@saflib/node-log-db` (persisted, redacted logs). */
export const getHubLogsDbKey = logsDbAccessor.getDbKey;

const issuesDbAccessor = createOnDiskDbKeyAccessor({
  packageUrl: import.meta.url,
  filePrefix: "issues-db",
  connect: issuesDb.connect,
});

/** Opaque key for `@saflib/errors-db` (grouped errors and warnings). */
export const getHubIssuesDbKey = issuesDbAccessor.getDbKey;

/**
 * Record server errors and warnings as grouped issues (`GET /ops/issues`),
 * alongside Sentry, which stays the hub's error service. Call once at
 * startup.
 */
export function installHubIssueCollector() {
  addErrorCollector(createIssueCollector({ getDbKey: getHubIssuesDbKey }));
  startIssueRetention(getHubIssuesDbKey);
}

/**
 * Persist this process's logs (redacted, searchable, retained 14 days / 512 MB)
 * for `GET /ops/logs`. Call once at startup, after `setServiceName`.
 */
export function enableHubPersistentLogs() {
  addTransport(
    createPersistentLogTransport({
      getDbKey: getHubLogsDbKey,
      // A log call that leaks a secret or PII becomes a warn issue to fix.
      onRedaction: createRedactionIssueRecorder({
        getDbKey: getHubIssuesDbKey,
        version: currentVersion(),
      }),
    }),
  );
}

export interface CreateHubOpsRouterOptions {
  /** Checks beyond the defaults (process, and disk for this package's data volume). */
  healthChecks?: HealthCheck[];
}

/**
 * The ops API (`/ops/*`, by ops token) and token admin (`/admin/ops-tokens`,
 * site admin) for the hub. Mount with the platform routers, and pass
 * {@link isOpsApiRequest} as `deferAuth` so the session gate lets ops calls
 * through to their own security.
 */
export function createHubOpsRouter(options: CreateHubOpsRouterOptions = {}) {
  return createOpsRouter({
    dbKey: getHubOpsDbKey(),
    logsDbKey: getHubLogsDbKey(),
    issuesDbKey: getHubIssuesDbKey(),
    healthChecks: [diskCheck({ path: dataDir }), ...(options.healthChecks ?? [])],
  });
}
