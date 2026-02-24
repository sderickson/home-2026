import { identityServiceFakeHandlers } from "@saflib/auth/fakes";

// BEGIN SORTED WORKFLOW AREA fake-group-imports FOR sdk/add-query sdk/add-mutation
import { recipesFakeHandlers } from "./requests/recipes/index.fakes.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA import-mocks FOR sdk/add-query sdk/add-mutation
import { resetMocks as recipesResetMocks } from "./requests/recipes/mocks.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA mock-data-exports FOR sdk/add-query sdk/add-mutation
export * from "./requests/recipes/mocks.ts";
// END WORKFLOW AREA

export const recipesServiceFakeHandlers = [
  ...identityServiceFakeHandlers,
  // BEGIN SORTED WORKFLOW AREA fake-group-handlers FOR sdk/add-query sdk/add-mutation
  ...recipesFakeHandlers,
  // END WORKFLOW AREA
];

export const resetMocks = () => {
  // BEGIN SORTED WORKFLOW AREA export-mocks FOR sdk/add-query sdk/add-mutation
  recipesResetMocks();
  // END WORKFLOW AREA
};
