import { recipesDbManager } from "../../instances.ts";
import { CollectionMemberNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { collectionMember } from "../../schemas/collection.ts";

export type RemoveCollectionMemberError = CollectionMemberNotFoundError;

export const removeCollectionMember = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<
    ReturnsError<
      typeof collectionMember.$inferSelect,
      RemoveCollectionMemberError
    >
  > => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .delete(collectionMember)
      .where(eq(collectionMember.id, id))
      .returning();

    if (result.length === 0) {
      return {
        error: new CollectionMemberNotFoundError(
          `Collection member with id '${id}' not found`,
        ),
      };
    }

    return { result: result[0] };
  },
);
