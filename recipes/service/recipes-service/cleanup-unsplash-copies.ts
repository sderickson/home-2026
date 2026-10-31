import type { DbKey } from "@saflib/drizzle";
import type { ObjectStore } from "@saflib/object-store";
import { recipeFileQueries } from "@sderickson/recipes-db";

export interface CleanupUnsplashCopiesResult {
  deleted: number;
  /** Set when the run stopped early on a storage error; the rest retry next startup. */
  stoppedOn?: Error;
}

/**
 * Delete stored copies of Unsplash photos that are now hotlinked (Unsplash's
 * API guidelines don't allow re-hosting). Safe to run on every startup: a
 * missing blob counts as deleted, and it's a no-op once all are gone.
 */
export async function cleanupUnsplashCopies(
  dbKey: DbKey,
  fileContainer: ObjectStore,
): Promise<CleanupUnsplashCopiesResult> {
  const result: CleanupUnsplashCopiesResult = { deleted: 0 };
  const { result: rows } =
    await recipeFileQueries.listStoredUnsplashCopiesRecipeFile(dbKey);

  for (const row of rows ?? []) {
    const deleteOut = await fileContainer.deleteFile(row.blob_name);
    if (deleteOut.error) {
      result.stoppedOn = deleteOut.error;
      break;
    }
    await recipeFileQueries.clearBlobRecipeFile(dbKey, row.id);
    console.log(
      `[recipes] Deleted stored Unsplash copy ${row.blob_name} (file ${row.id}, recipe ${row.recipe_id})`,
    );
    result.deleted++;
  }
  return result;
}
