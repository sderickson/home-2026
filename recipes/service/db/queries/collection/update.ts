import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { collection } from "../../schemas/collection.ts";

export type UpdateCollectionError = CollectionNotFoundError;

export interface UpdateCollectionParams {
  id: string;
  name: string;
}

export const updateCollection = queryWrapper(
  async (
    dbKey: DbKey,
    params: UpdateCollectionParams,
  ): Promise<ReturnsError<typeof collection.$inferSelect, UpdateCollectionError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .update(collection)
      .set({
        name: params.name,
        updatedAt: new Date(),
      })
      .where(eq(collection.id, params.id))
      .returning();

    if (result.length === 0) {
      return {
        error: new CollectionNotFoundError(
          `Collection with id '${params.id}' not found`,
        ),
      };
    }

    return { result: result[0] };
  },
);
