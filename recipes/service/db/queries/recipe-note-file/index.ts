// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { insertRecipeNoteFile } from "./insert.ts";
import { listRecipeNoteFile } from "./list.ts";
// END WORKFLOW AREA

export const recipeNoteFileQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  insertRecipeNoteFile,
  listRecipeNoteFile,
  // END WORKFLOW AREA
};
