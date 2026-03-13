import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { collection, collectionMember } from "../../schemas/collection.ts";

export type ListCollectionMemberError = CollectionNotFoundError;

export interface ListCollectionMemberParams {
  collectionId: string;
}

export const listCollectionMember = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListCollectionMemberParams,
  ): Promise<
    ReturnsError<typeof collectionMember.$inferSelect[], ListCollectionMemberError>
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const collectionRows = await db
      .select()
      .from(collection)
      .where(eq(collection.id, params.collectionId))
      .limit(1);
    if (collectionRows.length === 0) {
      return {
        error: new CollectionNotFoundError(
          `Collection with id '${params.collectionId}' not found`,
        ),
      };
    }

    const rows = await db
      .select()
      .from(collectionMember)
      .where(eq(collectionMember.collectionId, params.collectionId));

    return { result: rows };
  },
);
