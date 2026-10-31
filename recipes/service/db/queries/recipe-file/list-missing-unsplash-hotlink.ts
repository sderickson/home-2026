import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/utils";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, isNotNull, isNull } from "drizzle-orm";
import { recipeFile } from "../../schemas/recipe-file.ts";

/**
 * Files imported from Unsplash before hotlinking: stored copies with no
 * unsplash_image_url yet.
 */
export const listMissingUnsplashHotlinkRecipeFile = queryWrapper(
  async (
    dbKey: DbKey,
  ): Promise<ReturnsError<typeof recipeFile.$inferSelect[], never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .select()
      .from(recipeFile)
      .where(
        and(
          isNotNull(recipeFile.unsplash_user),
          isNull(recipeFile.unsplash_image_url),
        ),
      );
    return { result };
  },
);
