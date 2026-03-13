import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { inArray } from "drizzle-orm";
import { collectionMember } from "../../schemas/collection.ts";

export interface ListByCollectionIdsCollectionMemberParams {
  collectionIds: string[];
}

/** Returns all members for the given collection IDs. Empty array returns no rows. */
export const listByCollectionIdsCollectionMember = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListByCollectionIdsCollectionMemberParams,
  ): Promise<
    ReturnsError<typeof collectionMember.$inferSelect[], never>
  > => {
    if (params.collectionIds.length === 0) {
      return { result: [] };
    }
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select()
      .from(collectionMember)
      .where(inArray(collectionMember.collectionId, params.collectionIds));
    return { result: rows };
  },
);
