import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { collection } from "../../schemas/collection.ts";
import { menu, type MenuGrouping } from "../../schemas/menu.ts";

export type CreateMenuError = CollectionNotFoundError;

export interface CreateMenuParams {
  collectionId: string;
  name: string;
  isPublic: boolean;
  createdBy: string;
  groupings: MenuGrouping[];
  /** Defaults to [createdBy] when omitted. */
  editedByUserIds?: string[];
}

export const createMenu = queryWrapper(
  async (
    dbKey: DbKey,
    params: CreateMenuParams,
  ): Promise<
    ReturnsError<typeof menu.$inferSelect, CreateMenuError>
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

    const now = new Date();
    const editedByUserIds = params.editedByUserIds ?? [params.createdBy];

    const [inserted] = await db
      .insert(menu)
      .values({
        collectionId: params.collectionId,
        name: params.name,
        isPublic: params.isPublic,
        createdBy: params.createdBy,
        createdAt: now,
        updatedBy: params.createdBy,
        updatedAt: now,
        editedByUserIds,
        groupings: params.groupings,
      })
      .returning();

    return { result: inserted };
  },
);
