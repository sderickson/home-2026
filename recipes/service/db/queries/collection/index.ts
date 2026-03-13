// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { createCollection } from "./create.ts";
import { deleteCollection } from "./delete.ts";
import { getByIdCollection } from "./get-by-id.ts";
import { hasRecipesCollection } from "./has-recipes.ts";
import { listByEmailCollection } from "./list-by-email.ts";
import { updateCollection } from "./update.ts";
// END WORKFLOW AREA

export const collectionQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  createCollection,
  deleteCollection,
  getByIdCollection,
  hasRecipesCollection,
  listByEmailCollection,
  updateCollection,
  // END WORKFLOW AREA
};
