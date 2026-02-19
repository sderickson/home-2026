import { AsyncLocalStorage } from "async_hooks";
import type { DbKey } from "@saflib/drizzle";
import { recipesDb } from "@sderickson/recipes-db";

export interface RecipesServiceContext {
  recipesDbKey: DbKey;
}

export const recipesServiceStorage =
  new AsyncLocalStorage<RecipesServiceContext>();

export interface RecipesServiceContextOptions {
  recipesDbKey?: DbKey;
}

export const makeContext = (
  options: RecipesServiceContextOptions = {},
): RecipesServiceContext => {
  const dbKey = options.recipesDbKey ?? recipesDb.connect();
  return {
    recipesDbKey: dbKey,
  };
};
