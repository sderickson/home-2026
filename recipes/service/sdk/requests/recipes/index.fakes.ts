// BEGIN SORTED WORKFLOW AREA fake-handler-imports FOR sdk/add-query
import { getRecipeHandler } from "./get.fake.ts";
import { listRecipesHandler } from "./list.fake.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA mutation-handler-imports FOR sdk/add-mutation

// END WORKFLOW AREA

// export all fake handlers for this group
export const recipesFakeHandlers = [
  // BEGIN SORTED WORKFLOW AREA fake-handler-array FOR sdk/add-query
  getRecipeHandler,
  listRecipesHandler,
  // END WORKFLOW AREA

  // BEGIN SORTED WORKFLOW AREA mutation-handler-array FOR sdk/add-mutation

  // END WORKFLOW AREA
];
