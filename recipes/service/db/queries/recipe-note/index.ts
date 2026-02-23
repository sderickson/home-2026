// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { createRecipeNote } from "./create.ts";
import { deleteRecipeNote } from "./delete.ts";
import { listRecipeNote } from "./list.ts";
import { updateRecipeNote } from "./update.ts";
// END WORKFLOW AREA

export const recipeNoteQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  createRecipeNote,
  deleteRecipeNote,
  listRecipeNote,
  updateRecipeNote,
  // END WORKFLOW AREA
};
