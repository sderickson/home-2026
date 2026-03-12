import { recipesDbManager } from "../../instances.ts";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import type { ReturnsError } from "@saflib/monorepo";
import { eq } from "drizzle-orm";
import { collection, collectionMember } from "../../schemas/collection.ts";

export interface ListByEmailCollectionParams {
  email: string;
}

export const listByEmailCollection = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListByEmailCollectionParams,
  ): Promise<ReturnsError<typeof collection.$inferSelect[], never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select({
        id: collection.id,
        name: collection.name,
        createdBy: collection.createdBy,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
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
