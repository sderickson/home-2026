import { identityServiceFakeHandlers } from "@saflib/auth/fakes";

// BEGIN SORTED WORKFLOW AREA fake-group-imports FOR sdk/add-query sdk/add-mutation
import { recipesFakeHandlers } from "./requests/recipes/index.fakes.ts";
import { unsplashPhotosFakeHandlers } from "./requests/unsplash-photos/index.fakes.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA import-mocks FOR sdk/add-query sdk/add-mutation
import { resetMocks as recipesResetMocks } from "./requests/recipes/mocks.ts";
import { resetMocks as unsplashPhotosResetMocks } from "./requests/unsplash-photos/mocks.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA mock-data-exports FOR sdk/add-query sdk/add-mutation
export * from "./requests/recipes/mocks.ts";
export * from "./requests/unsplash-photos/mocks.ts";
// END WORKFLOW AREA

export const recipesServiceFakeHandlers = [
  ...identityServiceFakeHandlers,
  // BEGIN SORTED WORKFLOW AREA fake-group-handlers FOR sdk/add-query sdk/add-mutation
  ...recipesFakeHandlers,
  ...unsplashPhotosFakeHandlers,
  // END WORKFLOW AREA
];

export const resetMocks = () => {
  // BEGIN SORTED WORKFLOW AREA export-mocks FOR sdk/add-query sdk/add-mutation
  recipesResetMocks();
  unsplashPhotosResetMocks();
  // END WORKFLOW AREA
};
