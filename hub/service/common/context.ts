import { AsyncLocalStorage } from "async_hooks";
import type { DbKey } from "@saflib/drizzle";
import { hubDb } from "@sderickson/hub-db";

export interface HubServiceContext {
  hubDbKey: DbKey;
}

export const hubServiceStorage =
  new AsyncLocalStorage<HubServiceContext>();

export interface HubServiceContextOptions {
  hubDbKey?: DbKey;
}

export const makeContext = (
  options: HubServiceContextOptions = {},
): HubServiceContext => {
  const dbKey = options.hubDbKey ?? hubDb.connect();
  return {
    hubDbKey: dbKey,
  };
};
