import type { DbKey } from "@saflib/drizzle";
import { recipeFileQueries } from "@sderickson/recipes-db";
import {
  getPhoto,
  isMocked,
  UnsplashNotFoundError,
} from "@sderickson/recipes-unsplash";

/** Unsplash imports were stored as `unsplash-{photoId}.{ext}`. */
const UNSPLASH_FILENAME = /^unsplash-(.+)\.(jpg|png)$/;

export interface BackfillUnsplashHotlinksResult {
  updated: number;
  /** Rows whose photo id couldn't be parsed or no longer exists on Unsplash. */
  skipped: number;
  /** Set when the run stopped early (e.g. rate limit); the rest retry next startup. */
  stoppedOn?: Error;
}

/**
 * Point files imported from Unsplash before hotlinking at their Unsplash URLs.
 * Stored copies are left in blob storage for a later cleanup. Safe to run on
 * every startup: no-op once every row is hotlinked, and stops at the first
 * Unsplash error other than not-found so a rate limit just defers the rest.
 */
export async function backfillUnsplashHotlinks(
  dbKey: DbKey,
): Promise<BackfillUnsplashHotlinksResult> {
  const result: BackfillUnsplashHotlinksResult = { updated: 0, skipped: 0 };
  // Mock photos would overwrite real rows with placeholder URLs.
  if (isMocked()) return result;

  const { result: rows } =
    await recipeFileQueries.listMissingUnsplashHotlinkRecipeFile(dbKey);

  for (const row of rows ?? []) {
    const photoId = UNSPLASH_FILENAME.exec(row.file_original_name)?.[1];
    if (!photoId) {
      result.skipped++;
      continue;
    }
    const photoOut = await getPhoto(photoId);
    if (photoOut.error) {
      if (photoOut.error instanceof UnsplashNotFoundError) {
        result.skipped++;
        continue;
      }
      result.stoppedOn = photoOut.error;
      break;
    }
    await recipeFileQueries.setUnsplashHotlinkRecipeFile(dbKey, {
      id: row.id,
      unsplashPhotoId: photoId,
      unsplashImageUrl: photoOut.result.urls.raw,
    });
    result.updated++;
  }
  return result;
}
