import { recipesDbManager } from "../../instances.ts";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import type { ReturnsError } from "@saflib/monorepo";
import { eq } from "drizzle-orm";
import { collection, collectionMember } from "../../schemas/collection.ts";

export interface ListByEmailCollectionParams {
  email: string;
}

/** Row shape: collection fields plus isCreator from the joining member. */
export type ListByEmailCollectionRow = typeof collection.$inferSelect & {
  isCreator: boolean;
};

export const listByEmailCollection = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListByEmailCollectionParams,
  ): Promise<ReturnsError<ListByEmailCollectionRow[], never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select({
        id: collection.id,
        name: collection.name,
        createdBy: collection.createdBy,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        isCreator: collectionMember.isCreator,
      })
      .from(collection)
      .innerJoin(
        collectionMember,
        eq(collection.id, collectionMember.collectionId),
      )
      .where(eq(collectionMember.email, params.email));
    return { result: rows };
  },
);
