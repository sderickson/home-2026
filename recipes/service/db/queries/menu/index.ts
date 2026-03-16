// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { createMenu } from "./create.ts";
import { deleteMenu } from "./delete.ts";
import { getByIdMenu } from "./get-by-id.ts";
import { listByCollectionIdMenu } from "./list-by-collection-id.ts";
import { updateMenu } from "./update.ts";
// END WORKFLOW AREA

export const menuQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  createMenu,
  deleteMenu,
  getByIdMenu,
  listByCollectionIdMenu,
  updateMenu,
  // END WORKFLOW AREA
};
