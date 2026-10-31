import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/utils";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { and, isNotNull, ne } from "drizzle-orm";
import { recipeFile } from "../../schemas/recipe-file.ts";

/**
 * Hotlinked Unsplash files that still have a stored copy in blob storage
 * (imported before hotlinking).
 */
export const listStoredUnsplashCopiesRecipeFile = queryWrapper(
  async (
    dbKey: DbKey,
  ): Promise<ReturnsError<typeof recipeFile.$inferSelect[], never>> => {
    const db = recipesDbManager.get(dbKey)!;
    const result = await db
      .select()
      .from(recipeFile)
      .where(
        and(
          isNotNull(recipeFile.unsplash_image_url),
          ne(recipeFile.blob_name, ""),
        ),
      );
    return { result };
  },
);
