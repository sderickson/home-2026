import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/utils";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipeFile } from "../../schemas/recipe-file.ts";

export interface SetUnsplashHotlinkRecipeFileParams {
  id: string;
  unsplashPhotoId: string;
  unsplashImageUrl: string;
}

/**
 * Point an existing file at its Unsplash hotlink. Leaves blob_name alone so a
 * stored copy can still be cleaned up later.
 */
export const setUnsplashHotlinkRecipeFile = queryWrapper(
  async (
    dbKey: DbKey,
    params: SetUnsplashHotlinkRecipeFileParams,
  ): Promise<ReturnsError<void, never>> => {
    const db = recipesDbManager.get(dbKey)!;
    await db
      .update(recipeFile)
      .set({
        unsplash_photo_id: params.unsplashPhotoId,
        unsplash_image_url: params.unsplashImageUrl,
        updated_at: new Date(),
      })
      .where(eq(recipeFile.id, params.id));
    return { result: undefined };
  },
);
