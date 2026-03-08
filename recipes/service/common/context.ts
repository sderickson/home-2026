import { AsyncLocalStorage } from "async_hooks";
import type { DbKey } from "@saflib/drizzle";
import { createObjectStore } from "@saflib/object-store";
import type { ObjectStore } from "@saflib/object-store";
import { recipesDb } from "@sderickson/recipes-db";
import path from "path";
import fs from "fs";

export interface RecipesServiceContext {
  recipesDbKey: DbKey;
  /** Container for recipe file blobs (upload, delete, read). */
  // BEGIN SORTED WORKFLOW AREA storeProperties FOR service/add-store
  recipesFileContainer: ObjectStore;
  // END SORTED WORKFLOW AREA
}

export const recipesServiceStorage =
  new AsyncLocalStorage<RecipesServiceContext>();

export interface RecipesServiceContextOptions {
  recipesDbKey?: DbKey;
  // BEGIN SORTED WORKFLOW AREA storeOptions FOR service/add-store
  recipesFileContainer?: ObjectStore;
  // END SORTED WORKFLOW AREA
}

export const makeContext = (
  options: RecipesServiceContextOptions = {},
): RecipesServiceContext => {
  const dbKey = options.recipesDbKey ?? recipesDb.connect();
  const rootPath = path.join(import.meta.dirname, "data", "recipe-files");
  // ensure the directory exists
  fs.mkdirSync(rootPath, { recursive: true });
  // BEGIN WORKFLOW AREA storeInit FOR service/add-store
  const recipesFileContainer =
    options.recipesFileContainer ??
    createObjectStore({ type: "disk", rootPath });
  // END WORKFLOW AREA
  return {
    recipesDbKey: dbKey,
    // BEGIN SORTED WORKFLOW AREA storeReturn FOR service/add-store
    recipesFileContainer,
    // END SORTED WORKFLOW AREA
  };
};
