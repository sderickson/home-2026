import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { menu } from "../../schemas/menu.ts";

/**
 * List all public menus (is_public = true) across all collections.
 * Used by root app for GET /menus?publicOnly=true. No collection filter.
 */
export const listPublicMenu = queryWrapper(
  async (
    dbKey: DbKey,
  ): Promise<ReturnsError<typeof menu.$inferSelect[], never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .select()
      .from(menu)
      .where(eq(menu.isPublic, true));
    return { result };
  },
);
