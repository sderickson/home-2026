import { recipesDbManager } from "../../instances.ts";
import { MenuNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { menu } from "../../schemas/menu.ts";

export type DeleteMenuError = MenuNotFoundError;

export const deleteMenu = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<typeof menu.$inferSelect, DeleteMenuError>> => {
    const db = recipesDbManager.get(dbKey)!;

    const result = await db
      .delete(menu)
      .where(eq(menu.id, id))
      .returning();

    if (result.length === 0) {
      return {
        error: new MenuNotFoundError(`Menu with id '${id}' not found`),
      };
    }

    return { result: result[0] };
  },
);
