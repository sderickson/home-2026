import { recipesDbManager } from "../../instances.ts";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { generateShortId } from "@saflib/drizzle";
import type { ReturnsError } from "@saflib/monorepo";
import { collection, collectionMember } from "../../schemas/collection.ts";

export interface CreateCollectionParams {
  /** Optional; if omitted, a URL-safe id is generated. */
  id?: string;
  name: string;
  creatorEmail: string;
}

export const createCollection = queryWrapper(
  async (
    dbKey: DbKey,
    params: CreateCollectionParams,
  ): Promise<ReturnsError<typeof collection.$inferSelect, never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const collectionId = params.id ?? generateShortId();
    const now = new Date();

    const [inserted] = await db.transaction(async (tx) => {
      const [coll] = await tx
        .insert(collection)
        .values({
          id: collectionId,
          name: params.name,
          createdBy: params.creatorEmail,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      await tx.insert(collectionMember).values({
        collectionId: coll.id,
        email: params.creatorEmail,
        role: "owner",
        isCreator: true,
        createdAt: now,
      });

      return [coll];
    });

    return { result: inserted };
  },
);
