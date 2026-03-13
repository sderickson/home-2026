import { recipesDbManager } from "../../instances.ts";
import { MenuNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { menu } from "../../schemas/menu.ts";

export type GetByIdMenuError = MenuNotFoundError;

export const getByIdMenu = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<typeof menu.$inferSelect, GetByIdMenuError>> => {
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select()
      .from(menu)
      .where(eq(menu.id, id))
      .limit(1);
    if (rows.length === 0) {
      return {
        error: new MenuNotFoundError(`Menu with id '${id}' not found`),
      };
    }
    return { result: rows[0] };
  },
);
