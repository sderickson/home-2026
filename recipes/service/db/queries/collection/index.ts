// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { createCollection } from "./create.ts";
import { getByIdCollection } from "./get-by-id.ts";
import { listByEmailCollection } from "./list-by-email.ts";
// END WORKFLOW AREA

export const collectionQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  createCollection,
  getByIdCollection,
  listByEmailCollection,
  // END WORKFLOW AREA
};
