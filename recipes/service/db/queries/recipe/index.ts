// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { createVersionRecipe } from "./create-version.ts";
import { createWithVersionRecipe } from "./create-with-version.ts";
import { deleteRecipe } from "./delete.ts";
import { getByIdRecipe } from "./get-by-id.ts";
import { listRecipes } from "./list.ts";
import { updateLatestVersionRecipe } from "./update-latest-version.ts";
import { updateMetadataRecipe } from "./update-metadata.ts";
// END WORKFLOW AREA

export const recipeQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  createVersionRecipe,
  createWithVersionRecipe,
  deleteRecipe,
  getByIdRecipe,
  listRecipes,
  updateLatestVersionRecipe,
  updateMetadataRecipe,
  // END WORKFLOW AREA
};
