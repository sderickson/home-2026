import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, eq } from "drizzle-orm";
import {
  collection,
  collectionMember,
  type CollectionMemberRole,
} from "../../schemas/collection.ts";

export type AddCollectionMemberError = CollectionNotFoundError;

export interface AddCollectionMemberParams {
  collectionId: string;
  email: string;
  role: CollectionMemberRole;
}

export const addCollectionMember = queryWrapper(
  async (
    dbKey: DbKey,
    params: AddCollectionMemberParams,
  ): Promise<
    ReturnsError<
      typeof collectionMember.$inferSelect,
      AddCollectionMemberError
    >
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

    const existing = await db
      .select()
      .from(collectionMember)
      .where(
        and(
          eq(collectionMember.collectionId, params.collectionId),
          eq(collectionMember.email, params.email),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(collectionMember)
        .set({ role: params.role })
        .where(
          and(
            eq(collectionMember.collectionId, params.collectionId),
            eq(collectionMember.email, params.email),
          ),
        )
        .returning();
      return { result: updated };
    }

    const now = new Date();
    const [inserted] = await db
      .insert(collectionMember)
      .values({
        collectionId: params.collectionId,
        email: params.email,
        role: params.role,
        isCreator: false,
        createdAt: now,
      })
      .returning();
    return { result: inserted };
  },
);
