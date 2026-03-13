import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { collection } from "../../schemas/collection.ts";

export type GetByIdCollectionError = CollectionNotFoundError;

export const getByIdCollection = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<typeof collection.$inferSelect, GetByIdCollectionError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select()
      .from(collection)
      .where(eq(collection.id, id))
      .limit(1);
    if (rows.length === 0) {
      return {
        error: new CollectionNotFoundError(`Collection with id '${id}' not found`),
      };
    }
    return { result: rows[0] };
  },
);
