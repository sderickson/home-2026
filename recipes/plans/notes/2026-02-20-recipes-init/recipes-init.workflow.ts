import {
  defineWorkflow,
  step,
  makeWorkflowMachine,
  CdStepMachine,
} from "@saflib/workflows";
import {
  AddSchemaWorkflowDefinition,
  AddRouteWorkflowDefinition,
} from "@saflib/openapi/workflows";
import {
  UpdateSchemaWorkflowDefinition,
  AddDrizzleQueryWorkflowDefinition,
} from "@saflib/drizzle/workflows";
import { AddHandlerWorkflowDefinition } from "@saflib/express/workflows";
import {
  AddSdkQueryWorkflowDefinition,
  AddSdkMutationWorkflowDefinition,
} from "@saflib/sdk/workflows";
import { AddSpaViewWorkflowDefinition } from "@saflib/vue/workflows";

import path from "path";

const input = [] as const;

interface RecipesInitWorkflowContext {}

export const RecipesInitWorkflowDefinition = defineWorkflow<
  typeof input,
  RecipesInitWorkflowContext
>({
  id: "plans/recipes-init",
  description: "Implement recipes-init per spec and plan (recipes service + root/app clients).",
  input,
  context: ({ input }) => ({
    agentConfig: {
      ...input.agentConfig,
      resetTimeoutEachStep: true,
    },
  }),
  sourceUrl: import.meta.url,
  templateFiles: {},
  docFiles: {
    spec: path.join(import.meta.dirname, "recipes-init.spec.md"),
    plan: path.join(import.meta.dirname, "recipes-init.plan.md"),
  },

  versionControl: {
    allowPaths: ["**/*"],
    commitEachStep: true,
  },

  steps: [
    // --- Phase 1: Recipes (core) — packages: service/spec, service/db, service/http ---
    step(CdStepMachine, () => ({ path: "../service/spec" })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "recipe",
      prompt: `Add Recipe schema per spec: id, title, shortDescription, longDescription (optional), isPublic, createdBy, createdAt, updatedBy, updatedAt; optionally current version id for display. See docFiles.spec.`,
    })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "recipe-version",
      prompt: `Add RecipeVersion schema. Content shape: ingredients (array of { name, quantity, unit }), instructionsMarkdown (string). Include id, recipeId, content, isLatest, createdBy, createdAt. See docFiles.spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/list.yaml",
      prompt: `GET /recipes — list recipes; public-only for non-admin, admins see private too. See spec API #1.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/get.yaml",
      prompt: `GET /recipes/:id — one recipe with current version, optional notes and file list. See spec API #2.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/create.yaml",
      prompt: `POST /recipes — create recipe (and optional initial version). Admin only. See spec API #4.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/update.yaml",
      prompt: `PUT /recipes/:id — update recipe metadata only. Admin only. See spec API #5.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-list.yaml",
      prompt: `GET /recipes/:id/versions — list version history. See spec API #3.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-latest-update.yaml",
      prompt: `PUT /recipes/:id/versions/latest — update latest version in place. Admin only. See spec API #6.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-create.yaml",
      prompt: `POST /recipes/:id/versions — create new version (history). Admin only. See spec API #7.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/delete.yaml",
      prompt: `DELETE /recipes/:id — delete recipe. Admin only. See spec API #8.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/recipes.ts",
      prompt: `Add tables recipes and recipe_versions per spec. recipes: id, title, short_description, long_description, is_public, created_by, created_at, updated_by, updated_at. recipe_versions: id, recipe_id, content (JSON), is_latest, created_by, created_at. Index (recipe_id, is_latest). See docFiles.spec and plan Phase 1.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipes/list.ts",
      prompt: `List recipes; filter by public/admin per spec.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipes/get-by-id.ts",
      prompt: `Get recipe by id with latest version.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipes/create-with-version.ts",
      prompt: `Create recipe and first version in a transaction.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipes/update-metadata.ts",
      prompt: `Update recipe metadata (title, descriptions, is_public).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipes/update-latest-version.ts",
      prompt: `Update latest version content in place (set content on row where is_latest=true).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipes/create-version.ts",
      prompt: `Create new version: insert row, set is_latest on new row, clear on previous (transaction).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipes/delete.ts",
      prompt: `Delete recipe (and versions/notes/files per policy).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipes/versions-list.ts",
      prompt: `List versions for a recipe ordered by created_at.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/list.ts",
      prompt: `Handler for GET /recipes. Use list query; enforce public-only for non-admin.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/get.ts",
      prompt: `Handler for GET /recipes/:id. Use get-by-id; return recipe + current version + optional notes/files.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/create.ts",
      prompt: `Handler for POST /recipes. Admin only; use create-with-version.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/update.ts",
      prompt: `Handler for PUT /recipes/:id. Admin only; use update-metadata.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-list.ts",
      prompt: `Handler for GET /recipes/:id/versions. Use versions-list query.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-latest-update.ts",
      prompt: `Handler for PUT /recipes/:id/versions/latest. Admin only; use update-latest-version.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/versions-create.ts",
      prompt: `Handler for POST /recipes/:id/versions. Admin only; use create-version.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/delete.ts",
      prompt: `Handler for DELETE /recipes/:id. Admin only; use delete query.`,
    })),

    // --- Phase 2: Recipe notes — packages: service/spec, service/db, service/http ---
    step(CdStepMachine, () => ({ path: "../service/spec" })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "recipe-note",
      prompt: `Add RecipeNote schema: id, recipeId, recipeVersionId (optional), body, everEdited, createdBy, createdAt, updatedBy, updatedAt. See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-list.yaml",
      prompt: `GET /recipes/:id/notes — list notes for recipe. See spec API #9.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-create.yaml",
      prompt: `POST /recipes/:id/notes — create note. Admin only. See spec API #10.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-update.yaml",
      prompt: `PUT /recipes/:id/notes/:noteId — edit note; set everEdited. Admin only. See spec API #11.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-delete.yaml",
      prompt: `DELETE /recipes/:id/notes/:noteId. Admin only. See spec API #12.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/recipe-notes.ts",
      prompt: `Add table recipe_notes: id, recipe_id, recipe_version_id (nullable), body, ever_edited, created_by, created_at, updated_by, updated_at. Add queries for list, create, update, delete.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-notes/list.ts",
      prompt: `List notes for a recipe.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-notes/create.ts",
      prompt: `Create recipe note.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-notes/update.ts",
      prompt: `Update note body; set ever_edited to true.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-notes/delete.ts",
      prompt: `Delete recipe note.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-list.ts",
      prompt: `Handler GET /recipes/:id/notes.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-create.ts",
      prompt: `Handler POST /recipes/:id/notes. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-update.ts",
      prompt: `Handler PUT /recipes/:id/notes/:noteId. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-delete.ts",
      prompt: `Handler DELETE /recipes/:id/notes/:noteId. Admin only.`,
    })),

    // --- Phase 3: Recipe files (upload/list/delete) — use upload flag where needed ---
    step(CdStepMachine, () => ({ path: "../service/spec" })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "recipe-file-info",
      prompt: `Add RecipeFileInfo schema (file metadata: blob_name, file_original_name, mimetype, size, etc. per SAF fileMetadataColumns). See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/files-list.yaml",
      prompt: `GET /recipes/:id/files — list recipe files. See spec API #13.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/files-upload.yaml",
      upload: true,
      prompt: `POST /recipes/:id/files — upload file (multipart). Admin only. Azure storage. See spec API #14.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/files-delete.yaml",
      prompt: `DELETE /recipes/:id/files/:fileId. Admin only. See spec API #15.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/recipe-files.ts",
      file: true,
      prompt: `Add table recipe_files: id, recipe_id, ...fileMetadataColumns (from @saflib/drizzle/types/file-metadata), optional uploaded_by. Add queries list, insert, delete.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-files/list.ts",
      prompt: `List files for a recipe.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-files/insert.ts",
      prompt: `Insert recipe file row.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-files/delete.ts",
      prompt: `Delete recipe file by id.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/files-list.ts",
      prompt: `Handler GET /recipes/:id/files.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/files-upload.ts",
      upload: true,
      prompt: `Handler POST /recipes/:id/files (multipart). Admin only; wire to Azure.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/files-delete.ts",
      prompt: `Handler DELETE /recipes/:id/files/:fileId. Admin only.`,
    })),

    // --- Phase 4: Recipe note files ---
    step(CdStepMachine, () => ({ path: "../service/spec" })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "recipe-note-file-info",
      prompt: `Add RecipeNoteFileInfo schema (file metadata per SAF). See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-list.yaml",
      prompt: `GET /recipes/:id/notes/:noteId/files. See spec API #16.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-upload.yaml",
      upload: true,
      prompt: `POST /recipes/:id/notes/:noteId/files. Admin only. See spec API #17.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-delete.yaml",
      prompt: `DELETE /recipes/:id/notes/:noteId/files/:fileId. Admin only. See spec API #18.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/recipe-note-files.ts",
      file: true,
      prompt: `Add table recipe_note_files: id, recipe_note_id, ...fileMetadataColumns. Queries list, insert, delete.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-note-files/list.ts",
      prompt: `List files for a note.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-note-files/insert.ts",
      prompt: `Insert note file row.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/recipe-note-files/delete.ts",
      prompt: `Delete note file by id.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-list.ts",
      prompt: `Handler GET /recipes/:id/notes/:noteId/files.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-upload.ts",
      upload: true,
      prompt: `Handler POST /recipes/:id/notes/:noteId/files. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/recipes/notes-files-delete.ts",
      prompt: `Handler DELETE /recipes/:id/notes/:noteId/files/:fileId. Admin only.`,
    })),

    // --- Phase 5: Menus ---
    step(CdStepMachine, () => ({ path: "../service/spec" })),
    step(makeWorkflowMachine(AddSchemaWorkflowDefinition), () => ({
      name: "menu",
      prompt: `Add Menu schema: id, name, isPublic, createdBy, createdAt, editedByUserIds (array), groupings (array of { name, recipeIds }). See spec.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/list.yaml",
      prompt: `GET /menus. See spec API #19.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/get.yaml",
      prompt: `GET /menus/:id. See spec API #20.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/create.yaml",
      prompt: `POST /menus. Admin only. See spec API #21.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/update.yaml",
      prompt: `PUT /menus/:id; append current user to editedByUserIds if new. Admin only. See spec API #22.`,
    })),
    step(makeWorkflowMachine(AddRouteWorkflowDefinition), () => ({
      path: "./routes/menus/delete.yaml",
      prompt: `DELETE /menus/:id. Admin only. See spec API #23.`,
    })),

    step(CdStepMachine, () => ({ path: "../db" })),
    step(makeWorkflowMachine(UpdateSchemaWorkflowDefinition), () => ({
      path: "./schemas/menus.ts",
      prompt: `Add table menus: id, name, is_public, created_by, created_at, edited_by_user_ids (JSON), groupings (JSON). Queries list, get, create, update, delete. On update append user id to edited_by_user_ids.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/list.ts",
      prompt: `List menus (public filter for non-admin).`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/get.ts",
      prompt: `Get menu by id.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/create.ts",
      prompt: `Create menu.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/update.ts",
      prompt: `Update menu; append current user to editedByUserIds if not present.`,
    })),
    step(makeWorkflowMachine(AddDrizzleQueryWorkflowDefinition), () => ({
      path: "./queries/menus/delete.ts",
      prompt: `Delete menu.`,
    })),

    step(CdStepMachine, () => ({ path: "../http" })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/list.ts",
      prompt: `Handler GET /menus.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/get.ts",
      prompt: `Handler GET /menus/:id.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/create.ts",
      prompt: `Handler POST /menus. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/update.ts",
      prompt: `Handler PUT /menus/:id. Admin only.`,
    })),
    step(makeWorkflowMachine(AddHandlerWorkflowDefinition), () => ({
      path: "./routes/menus/delete.ts",
      prompt: `Handler DELETE /menus/:id. Admin only.`,
    })),

    // --- Phase 6: SDK (queries and mutations) — package: service/sdk ---
    step(CdStepMachine, () => ({ path: "../service/sdk" })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/list.ts",
      prompt: `Add query for GET /recipes (list). See plan Phase 6.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/get.ts",
      prompt: `Add query for GET /recipes/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/versions-list.ts",
      prompt: `Add query for GET /recipes/:id/versions.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-list.ts",
      prompt: `Add query for GET /recipes/:id/notes.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/files-list.ts",
      prompt: `Add query for GET /recipes/:id/files.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-files-list.ts",
      prompt: `Add query for GET /recipes/:id/notes/:noteId/files.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/menus/list.ts",
      prompt: `Add query for GET /menus.`,
    })),
    step(makeWorkflowMachine(AddSdkQueryWorkflowDefinition), () => ({
      path: "./requests/menus/get.ts",
      prompt: `Add query for GET /menus/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/create.ts",
      prompt: `Add mutation POST /recipes.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/update.ts",
      prompt: `Add mutation PUT /recipes/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/versions-latest-update.ts",
      prompt: `Add mutation PUT /recipes/:id/versions/latest.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/versions-create.ts",
      prompt: `Add mutation POST /recipes/:id/versions.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/delete.ts",
      prompt: `Add mutation DELETE /recipes/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-create.ts",
      prompt: `Add mutation POST /recipes/:id/notes.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-update.ts",
      prompt: `Add mutation PUT /recipes/:id/notes/:noteId.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-delete.ts",
      prompt: `Add mutation DELETE /recipes/:id/notes/:noteId.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/files-upload.ts",
      upload: true,
      prompt: `Add mutation POST /recipes/:id/files (upload).`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/files-delete.ts",
      prompt: `Add mutation DELETE /recipes/:id/files/:fileId.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-files-upload.ts",
      upload: true,
      prompt: `Add mutation POST /recipes/:id/notes/:noteId/files.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/recipes/notes-files-delete.ts",
      prompt: `Add mutation DELETE /recipes/:id/notes/:noteId/files/:fileId.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/create.ts",
      prompt: `Add mutation POST /menus.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/update.ts",
      prompt: `Add mutation PUT /menus/:id.`,
    })),
    step(makeWorkflowMachine(AddSdkMutationWorkflowDefinition), () => ({
      path: "./requests/menus/delete.ts",
      prompt: `Add mutation DELETE /menus/:id.`,
    })),

    // --- Phase 7: Root client — package: clients/root; after each view, refactor into SDK ---
    step(CdStepMachine, () => ({ path: "../clients/root" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/list",
      prompt: `Add public recipe list page (read-only). Use SDK recipe list query. After implementing, refactor shared listing/display into recipes/service/sdk (e.g. sdk/add-component for recipe list item) so app client can reuse. See plan Phase 7.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      prompt: `Add public recipe detail page (current version, ingredients, instructions). Use SDK. After implementing, refactor recipe display (for making/cooking) into recipes/service/sdk. See plan Phase 7.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/list",
      prompt: `Add public menu list page. After implementing, refactor menu list display into SDK if reusable. See plan Phase 7.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/detail",
      prompt: `Add public menu detail page (groupings, recipe ids, short descriptions from recipe). Refactor into SDK if reusable. See plan Phase 7.`,
    })),

    // --- Phase 8: App client — package: clients/app; one add-view per chunk ---
    step(CdStepMachine, () => ({ path: "../clients/app" })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/list",
      prompt: `Recipe list: admin sees all, non-admin sees public only; hide create for non-admin. Reuse SDK list/display. See plan Phase 8.1.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail",
      prompt: `Recipe detail (read-only first): current version, ingredients, instructions. Reuse SDK recipe display. No edit UI yet. See plan Phase 8.2.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-edit",
      prompt: `Update recipe detail: add edit (metadata + content). On save offer "Update latest version" vs "Save as new version." Admin only. See plan Phase 8.3.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-version-history",
      prompt: `Update recipe detail: add version history section (list versions, optionally diff). Admin only. See plan Phase 8.4.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-notes",
      prompt: `Update recipe detail: add notes section (list, add, edit note with ever_edited, optional version link). Admin only. See plan Phase 8.5.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-recipe-files",
      prompt: `Update recipe detail: add managing recipe files (list, upload, delete). Admin only. See plan Phase 8.6.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/recipes/detail-note-files",
      prompt: `Update recipe detail: add managing files per note (list, upload, delete per note). Admin only. See plan Phase 8.7.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/list",
      prompt: `Menu list: admin sees all, non-admin public; hide create for non-admin. Reuse SDK. See plan Phase 8.8.`,
    })),
    step(makeWorkflowMachine(AddSpaViewWorkflowDefinition), () => ({
      path: "./pages/menus/edit",
      prompt: `Menu create/edit: name, is_public, groupings (name + ordered recipe ids). Admin only. See plan Phase 8.9.`,
    })),
  ],
});

export default RecipesInitWorkflowDefinition;
