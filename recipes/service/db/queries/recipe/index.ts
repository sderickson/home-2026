// BEGIN SORTED WORKFLOW AREA query-exports FOR drizzle/add-query
import { createWithVersionRecipe } from "./create-with-version.ts";
import { getByIdRecipe } from "./get-by-id.ts";
import { listRecipes } from "./list.ts";
import { updateMetadataRecipe } from "./update-metadata.ts";
// END WORKFLOW AREA

export const recipeQueries = {
  // BEGIN SORTED WORKFLOW AREA query-object FOR drizzle/add-query
  createWithVersionRecipe,
  getByIdRecipe,
  listRecipes,
  updateMetadataRecipe,
  // END WORKFLOW AREA
};
