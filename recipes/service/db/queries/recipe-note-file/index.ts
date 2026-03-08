// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { deleteRecipeNoteFile } from "./delete.ts";
import { insertRecipeNoteFile } from "./insert.ts";
import { listRecipeNoteFile } from "./list.ts";
import { listRecipeNoteFilesByRecipeId } from "./list-by-recipe.ts";
// END WORKFLOW AREA

export const recipeNoteFileQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  deleteRecipeNoteFile,
  insertRecipeNoteFile,
  listRecipeNoteFile,
  listRecipeNoteFilesByRecipeId,
  // END WORKFLOW AREA
};
