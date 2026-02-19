import { AsyncLocalStorage } from "async_hooks";
import type { DbKey } from "@saflib/drizzle";
import { notebookDb } from "@sderickson/notebook-db";

export interface NotebookServiceContext {
  notebookDbKey: DbKey;
}

export const notebookServiceStorage =
  new AsyncLocalStorage<NotebookServiceContext>();

export interface NotebookServiceContextOptions {
  notebookDbKey?: DbKey;
}

export const makeContext = (
  options: NotebookServiceContextOptions = {},
): NotebookServiceContext => {
  const dbKey = options.notebookDbKey ?? notebookDb.connect();
  return {
    notebookDbKey: dbKey,
  };
};
