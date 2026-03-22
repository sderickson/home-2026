import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { collection, collectionMember } from "../../schemas/collection.ts";

export type DeleteCollectionError = CollectionNotFoundError;

export const deleteCollection = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<
    ReturnsError<typeof collection.$inferSelect, DeleteCollectionError>
  > => {
    const db = recipesDbManager.get(dbKey)!;

    const rows = await db
      .select()
      .from(collection)
      .where(eq(collection.id, id))
      .limit(1);
    if (rows.length === 0) {
      return {
        error: new CollectionNotFoundError(
          `Collection with id '${id}' not found`,
        ),
      };
    }

    const toReturn = rows[0];

    await db.transaction((tx) => {
      tx.delete(collectionMember)
        .where(eq(collectionMember.collectionId, id))
        .run();
      tx.delete(collection).where(eq(collection.id, id)).run();
    });

    return { result: toReturn };
  },
);
