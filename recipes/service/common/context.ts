import { AsyncLocalStorage } from "async_hooks";
import type { DbKey } from "@saflib/drizzle";
import { createObjectStore } from "@saflib/object-store";
import type { ObjectStore } from "@saflib/object-store";
import { recipesDb } from "@sderickson/recipes-db";

export interface RecipesServiceContext {
  recipesDbKey: DbKey;
  /** Container for recipe file blobs (upload, delete, read). */
  recipesFileContainer: ObjectStore;
}

export const recipesServiceStorage =
  new AsyncLocalStorage<RecipesServiceContext>();

export interface RecipesServiceContextOptions {
  recipesDbKey?: DbKey;
  /** When omitted, a default is created (TestObjectStore in test, else callers should pass one). */
  recipesFileContainer?: ObjectStore;
}

export const makeContext = (
  options: RecipesServiceContextOptions = {},
): RecipesServiceContext => {
  const dbKey = options.recipesDbKey ?? recipesDb.connect();
  const recipesFileContainer =
    options.recipesFileContainer ?? createObjectStore({ type: "test" });
  return {
    recipesDbKey: dbKey,
    recipesFileContainer,
  };
};
