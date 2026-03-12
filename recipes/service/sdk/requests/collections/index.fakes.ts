// BEGIN SORTED WORKFLOW AREA fake-handler-imports FOR sdk/add-query
import { getCollectionsHandler } from "./get.fake.ts";
import { listCollectionsHandler } from "./list.fake.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA mutation-handler-imports FOR sdk/add-mutation

// END WORKFLOW AREA

// export all fake handlers for this group
export const collectionsFakeHandlers = [
  // BEGIN SORTED WORKFLOW AREA fake-handler-array FOR sdk/add-query
  getCollectionsHandler,
  listCollectionsHandler,
  // END WORKFLOW AREA

  // BEGIN SORTED WORKFLOW AREA mutation-handler-array FOR sdk/add-mutation

  // END WORKFLOW AREA
];
