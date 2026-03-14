import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { collection } from "../../schemas/collection.ts";
import { menu } from "../../schemas/menu.ts";

export type ListByCollectionIdMenuError = CollectionNotFoundError;

export interface ListByCollectionIdMenuParams {
  collectionId: string;
}

export const listByCollectionIdMenu = queryWrapper(
  async (
    dbKey: DbKey,
    params: ListByCollectionIdMenuParams,
  ): Promise<
    ReturnsError<typeof menu.$inferSelect[], ListByCollectionIdMenuError>
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
      .from(menu)
      .where(eq(menu.collectionId, params.collectionId));

    return { result: rows };
  },
);
