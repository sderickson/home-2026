// BEGIN SORTED WORKFLOW AREA fake-handler-imports FOR sdk/add-query
import { getMenuHandler } from "./get.fake.ts";
import { listMenusHandler } from "./list.fake.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA mutation-handler-imports FOR sdk/add-mutation
import { createMenuHandler } from "./create.fake.ts";
import { updateMenuHandler } from "./update.fake.ts";
// END WORKFLOW AREA

// export all fake handlers for this group
export const menusFakeHandlers = [
  // BEGIN SORTED WORKFLOW AREA fake-handler-array FOR sdk/add-query
  getMenuHandler,
  listMenusHandler,
  // END WORKFLOW AREA

  // BEGIN SORTED WORKFLOW AREA mutation-handler-array FOR sdk/add-mutation
  createMenuHandler,
  updateMenuHandler,
  // END WORKFLOW AREA
];
