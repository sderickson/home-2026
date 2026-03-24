import { kratosFakeHandlers } from "./requests/kratos/kratos.fake.ts";
import { resetKratosFlowMocks } from "./requests/kratos/kratos-mocks.ts";

// BEGIN SORTED WORKFLOW AREA fake-group-imports FOR sdk/add-query sdk/add-mutation
import { collectionsFakeHandlers } from "./requests/collections/index.fakes.ts";
import { menusFakeHandlers } from "./requests/menus/index.fakes.ts";
import { recipesFakeHandlers } from "./requests/recipes/index.fakes.ts";
import { unsplashPhotosFakeHandlers } from "./requests/unsplash-photos/index.fakes.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA import-mocks FOR sdk/add-query sdk/add-mutation
import { clearMocks as collectionsClearMocks } from "./requests/collections/mocks.ts";
import { clearMocks as menusClearMocks } from "./requests/menus/mocks.ts";
import { clearMocks as recipesClearMocks } from "./requests/recipes/mocks.ts";
import { resetMocks as collectionsResetMocks } from "./requests/collections/mocks.ts";
import { resetMocks as menusResetMocks } from "./requests/menus/mocks.ts";
import { resetMocks as recipesResetMocks } from "./requests/recipes/mocks.ts";
import { resetMocks as unsplashPhotosResetMocks } from "./requests/unsplash-photos/mocks.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA mock-data-exports FOR sdk/add-query sdk/add-mutation
export * from "./requests/collections/mocks.ts";
export * from "./requests/menus/mocks.ts";
export * from "./requests/recipes/mocks.ts";
export * from "./requests/unsplash-photos/mocks.ts";
// END WORKFLOW AREA

export const recipesServiceFakeHandlers = [
  ...kratosFakeHandlers,
  // BEGIN SORTED WORKFLOW AREA fake-group-handlers FOR sdk/add-query sdk/add-mutation
  ...collectionsFakeHandlers,
  ...menusFakeHandlers,
  ...recipesFakeHandlers,
  ...unsplashPhotosFakeHandlers,
  // END WORKFLOW AREA
];

export {
  kratosFakeHandlers,
  kratosSessionLoggedInHandler,
} from "./requests/kratos/kratos.fake.ts";
export {
  getMockRegistrationPostResult,
  mockLoginFlow,
  mockRecoveryFlow,
  mockVerificationFlow,
  resetKratosFlowMocks,
  setMockRegistrationPostResult,
} from "./requests/kratos/kratos-mocks.ts";

export const resetMocks = () => {
  resetKratosFlowMocks();
  // BEGIN SORTED WORKFLOW AREA export-mocks FOR sdk/add-query sdk/add-mutation
  collectionsResetMocks();
  menusResetMocks();
  recipesResetMocks();
  unsplashPhotosResetMocks();
  // END WORKFLOW AREA
};

/** Empty collection, menu, and recipe mocks (e.g. before demo seed so only Seed Kitchen appears). */
export const clearMocks = () => {
  collectionsClearMocks();
  menusClearMocks();
  recipesClearMocks();
};
