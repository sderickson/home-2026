import { recipesDbManager } from "../../instances.ts";
import { CollectionMemberNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import {
  collectionMember,
  type CollectionMemberRole,
} from "../../schemas/collection.ts";

export type UpdateRoleCollectionMemberError = CollectionMemberNotFoundError;

export interface UpdateRoleCollectionMemberParams {
  id: string;
  role: CollectionMemberRole;
}

export const updateRoleCollectionMember = queryWrapper(
  async (
    dbKey: DbKey,
    params: UpdateRoleCollectionMemberParams,
  ): Promise<
    ReturnsError<
      typeof collectionMember.$inferSelect,
      UpdateRoleCollectionMemberError
    >
  > => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .update(collectionMember)
      .set({ role: params.role })
      .where(eq(collectionMember.id, params.id))
      .returning();

    if (result.length === 0) {
      return {
        error: new CollectionMemberNotFoundError(
          `Collection member with id '${params.id}' not found`,
        ),
      };
    }

    return { result: result[0] };
  },
);
