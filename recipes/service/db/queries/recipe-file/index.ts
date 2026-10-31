// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { deleteRecipeFile } from "./delete.ts";
import { insertRecipeFile } from "./insert.ts";
import { listByRecipeIdsRecipeFile } from "./list-by-recipe-ids.ts";
import { listMissingUnsplashHotlinkRecipeFile } from "./list-missing-unsplash-hotlink.ts";
import { listRecipeFile } from "./list.ts";
import { setUnsplashHotlinkRecipeFile } from "./set-unsplash-hotlink.ts";
// END WORKFLOW AREA

export const recipeFileQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  deleteRecipeFile,
  insertRecipeFile,
  listByRecipeIdsRecipeFile,
  listMissingUnsplashHotlinkRecipeFile,
  listRecipeFile,
  setUnsplashHotlinkRecipeFile,
  // END WORKFLOW AREA
};
