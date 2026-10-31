import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/utils";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { inArray } from "drizzle-orm";
import { menu } from "../../schemas/menu.ts";

export interface ListByCollectionIdsMenuParams {
  collectionIds: string[];
}

/** Returns all menus for the given collection IDs. Empty array returns no rows. */
export const listByCollectionIdsMenu = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListByCollectionIdsMenuParams,
  ): Promise<ReturnsError<typeof menu.$inferSelect[], never>> => {
    if (params.collectionIds.length === 0) {
      return { result: [] };
    }
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select()
      .from(menu)
      .where(inArray(menu.collectionId, params.collectionIds));
    return { result: rows };
  },
);
