import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { menu } from "../../schemas/menu.ts";

export const getByIdMenu = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<typeof menu.$inferSelect | null, never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const rows = await db
      .select()
      .from(menu)
      .where(eq(menu.id, id))
      .limit(1);
    return { result: rows.length === 0 ? null : rows[0] };
  },
);
