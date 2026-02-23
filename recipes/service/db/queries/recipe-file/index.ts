// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { deleteRecipeFile } from "./delete.ts";
import { insertRecipeFile } from "./insert.ts";
import { listRecipeFile } from "./list.ts";
// END WORKFLOW AREA

export const recipeFileQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  deleteRecipeFile,
  insertRecipeFile,
  listRecipeFile,
  // END WORKFLOW AREA
};
