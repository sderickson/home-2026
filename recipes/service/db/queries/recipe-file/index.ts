// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { clearBlobRecipeFile } from "./clear-blob.ts";
import { deleteRecipeFile } from "./delete.ts";
import { insertRecipeFile } from "./insert.ts";
import { listByRecipeIdsRecipeFile } from "./list-by-recipe-ids.ts";
import { listMissingUnsplashHotlinkRecipeFile } from "./list-missing-unsplash-hotlink.ts";
import { listRecipeFile } from "./list.ts";
import { listStoredUnsplashCopiesRecipeFile } from "./list-stored-unsplash-copies.ts";
import { setUnsplashHotlinkRecipeFile } from "./set-unsplash-hotlink.ts";
// END WORKFLOW AREA

export const recipeFileQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  clearBlobRecipeFile,
  deleteRecipeFile,
  insertRecipeFile,
  listByRecipeIdsRecipeFile,
  listMissingUnsplashHotlinkRecipeFile,
  listRecipeFile,
  listStoredUnsplashCopiesRecipeFile,
  setUnsplashHotlinkRecipeFile,
  // END WORKFLOW AREA
};
