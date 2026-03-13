import { recipesDbManager } from "../../instances.ts";
import { MenuNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { menu, type MenuGrouping } from "../../schemas/menu.ts";

export type UpdateMenuError = MenuNotFoundError;

export interface UpdateMenuParams {
  id: string;
  name: string;
  isPublic: boolean;
  groupings: MenuGrouping[];
  /** Full replacement; handler appends and passes the new array. */
  editedByUserIds: string[];
  /** When omitted, existing updatedBy is left unchanged. */
  updatedBy?: string;
}

export const updateMenu = queryWrapper(
  async (
    dbKey: DbKey,
    params: UpdateMenuParams,
  ): Promise<ReturnsError<typeof menu.$inferSelect, UpdateMenuError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();

    const result = await db
      .update(menu)
      .set({
        name: params.name,
        isPublic: params.isPublic,
        groupings: params.groupings,
        editedByUserIds: params.editedByUserIds,
        updatedAt: now,
        ...(params.updatedBy !== undefined && { updatedBy: params.updatedBy }),
      })
      .where(eq(menu.id, params.id))
      .returning();

    if (result.length === 0) {
      return {
        error: new MenuNotFoundError(
          `Menu with id '${params.id}' not found`,
        ),
      };
    }

    return { result: result[0] };
  },
);
