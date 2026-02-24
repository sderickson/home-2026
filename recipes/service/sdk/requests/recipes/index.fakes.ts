// BEGIN SORTED WORKFLOW AREA fake-handler-imports FOR sdk/add-query
import { filesListRecipesHandler } from "./files-list.fake.ts";
import { getRecipeHandler } from "./get.fake.ts";
import { listRecipesHandler } from "./list.fake.ts";
import { notesListRecipesHandler } from "./notes-list.fake.ts";
import { versionsListRecipesHandler } from "./versions-list.fake.ts";
// END WORKFLOW AREA

// BEGIN SORTED WORKFLOW AREA mutation-handler-imports FOR sdk/add-mutation
import { createRecipesHandler } from "./create.fake.ts";
import { deleteRecipesHandler } from "./delete.fake.ts";
import { notesCreateRecipesHandler } from "./notes-create.fake.ts";
import { notesDeleteRecipesHandler } from "./notes-delete.fake.ts";
import { notesUpdateRecipesHandler } from "./notes-update.fake.ts";
import { updateRecipesHandler } from "./update.fake.ts";
import { versionsCreateRecipesHandler } from "./versions-create.fake.ts";
import { versionsLatestUpdateRecipesHandler } from "./versions-latest-update.fake.ts";
// END WORKFLOW AREA

// export all fake handlers for this group
export const recipesFakeHandlers = [
  // BEGIN SORTED WORKFLOW AREA fake-handler-array FOR sdk/add-query
  filesListRecipesHandler,
  getRecipeHandler,
  listRecipesHandler,
  notesListRecipesHandler,
  versionsListRecipesHandler,
  // END WORKFLOW AREA

  // BEGIN SORTED WORKFLOW AREA mutation-handler-array FOR sdk/add-mutation
  createRecipesHandler,
  deleteRecipesHandler,
  notesCreateRecipesHandler,
  notesDeleteRecipesHandler,
  notesUpdateRecipesHandler,
  updateRecipesHandler,
  versionsCreateRecipesHandler,
  versionsLatestUpdateRecipesHandler,
  // END WORKFLOW AREA
];
