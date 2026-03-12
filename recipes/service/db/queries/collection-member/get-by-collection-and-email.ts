import { recipesDbManager } from "../../instances.ts";
import { CollectionMemberNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import { collectionMember } from "../../schemas/collection.ts";

export type GetByCollectionAndEmailCollectionMemberError =
  CollectionMemberNotFoundError;

export interface GetByCollectionAndEmailCollectionMemberParams {
  collectionId: string;
  email: string;
}

export const getByCollectionAndEmailCollectionMember = queryWrapper(
  async (
    dbKey: DbKey,
    params: GetByCollectionAndEmailCollectionMemberParams,
  ): Promise<
    ReturnsError<
      typeof collectionMember.$inferSelect,
      GetByCollectionAndEmailCollectionMemberError
    >
  > => {
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select()
      .from(collectionMember)
      .where(
        and(
          eq(collectionMember.collectionId, params.collectionId),
          eq(collectionMember.email, params.email),
        ),
      )
      .limit(1);

    if (rows.length === 0) {
      return {
        error: new CollectionMemberNotFoundError(
          `Collection member not found for collection '${params.collectionId}' and email '${params.email}'`,
        ),
      };
    }

    return { result: rows[0] };
  },
);
