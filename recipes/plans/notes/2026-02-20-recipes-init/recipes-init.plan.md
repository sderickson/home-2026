# Recipes Init — Implementation Plan

This plan breaks the spec into workflow-sized chunks. Run workflows from the **recipes** directory (or as required by each workflow’s `CdStepMachine`) so that paths resolve correctly. After each phase, you have a testable stopping point.

---

## Phase 1: Recipes (core) — schema, API, DB, handlers

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Recipe CRUD + versioning (list, get, create, update metadata, delete; get versions; update latest in place; create new version) working via API.

1. **OpenAPI schemas** — `openapi/add-schema` (cwd: `recipes/service/spec`):
   - Add schemas: `Recipe`, `RecipeVersion` (include recipe content shape: ingredients array, instructionsMarkdown).
2. **OpenAPI routes** — `openapi/add-route` (cwd: `recipes/service/spec`):
   - Routes for recipes: list, get, create, update, delete, versions list, `versions/latest` (PUT), versions create (POST). Paths per existing spec route layout (e.g. `./routes/recipes/list.yaml`, `./routes/recipes/get.yaml`, etc.).
3. **Drizzle schema** — `drizzle/update-schema` (cwd: `recipes/service/db`):
   - Path to schema file per existing db layout (e.g. `./schemas/recipes.ts` or single `schema.ts` as used by the package).
   - Add tables: `recipes` (id, title, short_description, long_description, is_public, created_by, created_at, updated_by, updated_at), `recipe_versions` (id, recipe_id, content JSON, is_latest, created_by, created_at). Index on (recipe_id, is_latest).
4. **Drizzle queries** — `drizzle/add-query` (cwd: `recipes/service/db`):
   - Queries for: list recipes (filter by public/admin), get recipe by id, get latest version, create recipe + first version, update recipe metadata, update latest version in place, create new version (transaction: insert + clear previous is_latest), delete recipe.
5. **Express handlers** — `express/add-handler` (cwd: `recipes/service/http`):
   - Handlers for each recipe route; call db queries; enforce admin for mutations and public-only for non-admin reads.

**Stopping point:** Recipe API works (no notes, files, or menus yet).

---

## Phase 2: Recipe notes — schema, API, DB, handlers

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Notes CRUD (list, create, update, delete) for a recipe, with optional link to version.

1. **OpenAPI** (cwd: `recipes/service/spec`) — Add schema `RecipeNote`; add routes for notes (list, create, update, delete).
2. **Drizzle** (cwd: `recipes/service/db`) — Add table `recipe_notes` (id, recipe_id, recipe_version_id nullable, body, ever_edited, created_by, created_at, updated_by, updated_at). Add queries.
3. **Express** (cwd: `recipes/service/http`) — Add handlers for note routes; set `ever_edited` on update.

**Stopping point:** Notes API works.

---

## Phase 3: Recipe files — upload/list/delete

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Multiple files per recipe; upload (Azure), list, delete. Use SAF file metadata and upload workflows.

1. **OpenAPI** (cwd: `recipes/service/spec`) — Add schema `RecipeFileInfo` (or use file metadata shape); add routes for recipe files: list, upload (use **upload** flag), delete by file id.
2. **Drizzle** (cwd: `recipes/service/db`) — `drizzle/update-schema` with **file** flag for table `recipe_files` (id, recipe_id, …fileMetadataColumns, uploaded_by). Add queries (list by recipe_id, insert, delete by id).
3. **Express** (cwd: `recipes/service/http`) — `express/add-handler` with **upload** flag for upload route; handlers for list and delete. Wire to Azure/store per workflow.

**Stopping point:** Recipe file upload/list/delete works. (SDK queries/mutations for files come in Phase 6.)

---

## Phase 4: Recipe note files

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Multiple files per note; same pattern as recipe files.

1. **OpenAPI** (cwd: `recipes/service/spec`) — Add schema `RecipeNoteFileInfo`; routes for note files: list, upload (**upload** flag), delete by file id.
2. **Drizzle** (cwd: `recipes/service/db`) — `drizzle/update-schema` with **file** flag for `recipe_note_files` (id, recipe_note_id, …fileMetadataColumns). Add queries.
3. **Express** (cwd: `recipes/service/http`) — Handlers with upload for note files.

**Stopping point:** Note file upload works.

---

## Phase 5: Menus — schema, API, DB, handlers

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Menu CRUD with nested groupings (JSON). No separate grouping tables.

1. **OpenAPI** (cwd: `recipes/service/spec`) — Add schema `Menu` (groupings as array of `{ name, recipeIds }`, editedByUserIds array). Add routes: list, get, create, update, delete.
2. **Drizzle** (cwd: `recipes/service/db`) — Add table `menus` (id, name, is_public, created_by, created_at, edited_by_user_ids JSON, groupings JSON). Add queries; on update, append current user id to edited_by_user_ids if not present.
3. **Express** (cwd: `recipes/service/http`) — Handlers for menu routes.

**Stopping point:** Menus API works.

---

## Phase 6: SDK — queries and mutations (shared by root and app)

**Packages:** `recipes/service/sdk`.

**Goal:** TanStack Query hooks and mutations so both clients can call the API. No shared components yet—those are extracted from the root client in Phase 7.

1. **Queries** (cwd: `recipes/service/sdk`) — `sdk/add-query` for: recipes list, recipe get, recipe versions list; notes list; recipe files list, note files list; menus list, menu get.
2. **Mutations** (cwd: `recipes/service/sdk`) — `sdk/add-mutation` for: recipe create/update/delete, version create, version update latest; note create/update/delete; recipe file upload, recipe file delete; note file upload, note file delete; menu create/update/delete. Use **upload** flag for file upload mutations.

**Stopping point:** SDK is ready for both clients; API is fully consumable.

---

## Phase 7: Root client (logged-out / public)

**Packages:** `recipes/clients/root`, then `recipes/service/sdk` (when refactoring).

**Goal:** Public recipe list, recipe detail, menu list, menu detail. Read-only; no edit UI. After each page (or logical group), refactor shared logic into the SDK so the app client can reuse it.

1. **Public recipe list** — `vue/add-view` (cwd: `recipes/clients/root` or the app that builds root). Implement public recipe list page using SDK queries.
   - **Prompt after:** Refactor listing/display logic into `recipes/service/sdk` (e.g. `sdk/add-component` for recipe list item/card) so the app client can reuse it.
2. **Public recipe detail** — `vue/add-view` (same package). Implement public recipe detail page (current version, ingredients, instructions, optional notes/files if exposed).
   - **Prompt after:** Refactor recipe display (for making/cooking) into `recipes/service/sdk` so the app client can reuse it.
3. **Public menu list** — `vue/add-view`. Implement public menu list page.
   - **Prompt after:** Refactor menu list display into `recipes/service/sdk` if reusable.
4. **Public menu detail** — `vue/add-view`. Implement public menu detail page (groupings, recipe ids with short descriptions from recipe).
   - **Prompt after:** Refactor menu detail display into `recipes/service/sdk` if reusable.

Use SDK queries only; no mutations. Permission checks: show only public content (same as API enforcement).

**Stopping point:** Logged-out experience is complete; shared components live in SDK for use by app client.

---

## Phase 8: App client (logged-in)

**Packages:** `recipes/clients/app`, `recipes/service/sdk` (use shared components from Phase 7).

**Goal:** Full experience for admins (CRUD, versions, notes, files, menus); read-only for non-admins with edit UI hidden. Break into multiple `vue/add-view` (or view updates) so each chunk is manageable; add-view can create a new view or update an existing one.

1. **Recipe list** — `vue/add-view` (cwd: `recipes/clients/app`). Recipe list page: admin sees all recipes; non-admin sees public only. Hide “create recipe” for non-admin. Reuse list/display from SDK where possible.
2. **Recipe detail (view)** — `vue/add-view`. Recipe detail page in read-only form: current version, ingredients, instructions, descriptions. Reuse recipe display from SDK. No edit UI yet.
3. **Recipe edit (metadata + content)** — `vue/add-view` (update the recipe detail view). Add ability to edit: recipe metadata (title, short/long description, is_public) and recipe content. On save, offer choice: “Update latest version” vs “Save as new version.” Show edit UI only for admin.
4. **Version history** — `vue/add-view` (update recipe detail view). Add version history section: list versions, optionally diff or compare. Admin only.
5. **Notes on recipe** — `vue/add-view` (update recipe detail view). Add notes section: list notes, add note, edit note (with ever_edited), optional link to version. Admin only.
6. **Recipe files** — `vue/add-view` (update recipe detail view). Add managing recipe files: list, upload, delete. Admin only.
7. **Note files** — `vue/add-view` (update recipe detail view or note row). Add managing files for a note: list, upload, delete per note. Admin only.
8. **Menu list** — `vue/add-view`. Menu list page: admin sees all; non-admin sees public; hide “create menu” for non-admin. Reuse menu list from SDK where possible.
9. **Menu create/edit** — `vue/add-view`. Menu create and edit: name, is_public, groupings (name + ordered recipe ids). Admin only.

Use SDK queries and mutations throughout. Gate all mutation UI and create buttons on admin role; non-admin sees same as root (read-only public).

**Stopping point:** Full app works; ready for review and polish.

---

## Workflow reference

- **Backend:** `openapi/add-schema`, `openapi/add-route` (flag: `upload`), `drizzle/update-schema` (flag: `file`), `drizzle/add-query`, `express/add-handler` (flag: `upload`).
- **Frontend:** `sdk/add-query`, `sdk/add-mutation` (flag: `upload`), `sdk/add-component`, `vue/add-view`.

Run `npm exec saf-workflow dry-run ./path/to/workflow.ts` for each workflow to verify wiring; ensure workflows that need to run in a specific package use `CdStepMachine` to change into that directory.
