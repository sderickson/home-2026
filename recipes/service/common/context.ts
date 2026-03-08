import { AsyncLocalStorage } from "async_hooks";
import type { DbKey } from "@saflib/drizzle";
// BEGIN SORTED WORKFLOW AREA storeImports FOR service/add-store
import type { ObjectStore } from "@saflib/object-store";
import { createObjectStore } from "@saflib/object-store";
// END WORKFLOW AREA
import { recipesDb } from "@sderickson/recipes-db";
import path from "path";
import fs from "fs";

/** Default disk-backed file store for recipe/note blobs. Use when no container is passed (e.g. from tests). */
export function getDefaultRecipesFileContainer(): ObjectStore {
  const rootPath = path.join(import.meta.dirname, "data", "recipe-files");
  fs.mkdirSync(rootPath, { recursive: true });
  return createObjectStore({ type: "disk", rootPath });
}

export interface RecipesServiceContext {
  recipesDbKey: DbKey;
  /** Container for recipe file blobs (upload, delete, read). */
  // BEGIN SORTED WORKFLOW AREA storeProperties FOR service/add-store
  recipesFileContainer: ObjectStore;
  // END WORKFLOW AREA
}

export const recipesServiceStorage =
  new AsyncLocalStorage<RecipesServiceContext>();

export interface RecipesServiceContextOptions {
  recipesDbKey?: DbKey;
  // BEGIN SORTED WORKFLOW AREA storeOptions FOR service/add-store
  recipesFileContainer?: ObjectStore;
  // END WORKFLOW AREA
}

export const makeContext = (
  options: RecipesServiceContextOptions = {},
): RecipesServiceContext => {
  const dbKey = options.recipesDbKey ?? recipesDb.connect();
  // BEGIN WORKFLOW AREA storeInit FOR service/add-store
  const recipesFileContainer =
    options.recipesFileContainer ?? getDefaultRecipesFileContainer();
  // END WORKFLOW AREA
  return {
    recipesDbKey: dbKey,
    // BEGIN SORTED WORKFLOW AREA storeReturn FOR service/add-store
    recipesFileContainer,
    // END WORKFLOW AREA
  };
};
