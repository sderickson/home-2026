import { AsyncLocalStorage } from "async_hooks";
import type { DbKey } from "@saflib/drizzle";
import { baseDb } from "@sderickson/notebook-db/instances";
import { auditDb } from "@saflib/audit-db/instances";
// BEGIN WORKFLOW AREA storeImports FOR service/add-store


// END WORKFLOW AREA

export interface NotebookServiceContext {
  baseDbKey: DbKey;
  auditDbKey: DbKey;
  // BEGIN WORKFLOW AREA storeProperties FOR service/add-store

  // END WORKFLOW AREA
}

export const baseServiceStorage =
  new AsyncLocalStorage<NotebookServiceContext>();

export interface NotebookServiceContextOptions {
  baseDbKey?: DbKey;
  auditDbKey?: DbKey;
  // BEGIN WORKFLOW AREA storeOptions FOR service/add-store

  // END WORKFLOW AREA
}

export const makeContext = (
  options: NotebookServiceContextOptions = {},
): NotebookServiceContext => {
  const dbKey = options.baseDbKey ?? baseDb.connect();
  const auditDbKey = options.auditDbKey ?? auditDb.connect();
  // BEGIN WORKFLOW AREA storeInit FOR service/add-store


  // END WORKFLOW AREA
  return {
    baseDbKey: dbKey,
    auditDbKey,
    // BEGIN WORKFLOW AREA storeReturn FOR service/add-store

    // END WORKFLOW AREA
  };
};
