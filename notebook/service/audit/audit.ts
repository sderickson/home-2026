import { auditDb } from "@saflib/audit-db/instances";
import { createAuditRecorder } from "@saflib/audit-http/express/audit-recorder";
import { createAuditLogsRouter } from "@saflib/audit-http/express/createAuditLogsRouter";
import { createOnDiskDbKeyAccessor, type DbKey } from "@saflib/drizzle";
import {
  baseServiceStorage,
  type NotebookServiceContext,
} from "@sderickson/notebook-service-common/context";
import { baseAuditMap } from "./audit-map.ts";

const auditDbAccessor = createOnDiskDbKeyAccessor({
  packageUrl: import.meta.url,
  filePrefix: "audit-db",
  connect: auditDb.connect,
});

/** Opaque key for `@saflib/audit-db` (separate from the main app DB). */
export const getNotebookAuditDbKey = auditDbAccessor.getDbKey;

function resolveAuditDbKeyFromContext(): DbKey | undefined {
  return baseServiceStorage.getStore()?.auditDbKey;
}

export const baseAuditRecorder = createAuditRecorder({
  getAuditDbKey: resolveAuditDbKeyFromContext,
  auditMap: baseAuditMap,
});

export function baseAuditRecorderMiddleware() {
  return baseAuditRecorder.middleware();
}

export function createNotebookAuditRouter() {
  return createAuditLogsRouter({
    getAuditDbKey: () => {
      const fromContext = resolveAuditDbKeyFromContext();
      return fromContext ?? getNotebookAuditDbKey();
    },
  });
}

export function connectNotebookAuditDb(
  context: NotebookServiceContext,
): NotebookServiceContext {
  return {
    ...context,
    auditDbKey: getNotebookAuditDbKey(),
  };
}

export { baseAuditMap } from "./audit-map.ts";
