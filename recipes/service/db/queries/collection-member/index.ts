// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { addCollectionMember } from "./add.ts";
import { getByCollectionAndEmailCollectionMember } from "./get-by-collection-and-email.ts";
import { listByCollectionIdsCollectionMember } from "./list-by-collection-ids.ts";
import { listCollectionMember } from "./list.ts";
import { removeCollectionMember } from "./remove.ts";
import { updateRoleCollectionMember } from "./update-role.ts";
// END WORKFLOW AREA

export const collectionMemberQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  addCollectionMember,
  getByCollectionAndEmailCollectionMember,
  listByCollectionIdsCollectionMember,
  listCollectionMember,
  removeCollectionMember,
  updateRoleCollectionMember,
  // END WORKFLOW AREA
};
