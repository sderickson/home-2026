// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { addCollectionMember } from "./add.ts";
import { getByCollectionAndEmailCollectionMember } from "./get-by-collection-and-email.ts";
import { listCollectionMember } from "./list.ts";
// END WORKFLOW AREA

export const collectionMemberQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  addCollectionMember,
  getByCollectionAndEmailCollectionMember,
  listCollectionMember,
  // END WORKFLOW AREA
};
