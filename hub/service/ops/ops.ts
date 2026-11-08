import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOnDiskDbKeyAccessor } from "@saflib/drizzle";
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
    healthChecks: [diskCheck({ path: dataDir }), ...(options.healthChecks ?? [])],
  });
}
