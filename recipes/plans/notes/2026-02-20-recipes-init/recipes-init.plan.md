# Recipes Init — Implementation Plan

This plan breaks the spec into workflow-sized chunks. Run workflows from the **recipes** directory (or as required by each workflow’s `CdStepMachine`) so that paths resolve correctly. After each phase, you have a testable stopping point.

---

## Phase 1: Recipes (core) — schema, API, DB, handlers

**Goal:** Recipe CRUD + versioning (list, get, create, update metadata, delete; get versions; update latest in place; create new version) working via API.

1. **OpenAPI schemas** — `openapi/add-schema` (run from `recipes/service/spec` or with cwd set):
   - Add schemas: `Recipe`, `RecipeVersion` (include recipe content shape: ingredients array, instructionsMarkdown).
2. **OpenAPI routes** — `openapi/add-route`:
   - Routes for recipes: list, get, create, update, delete, versions list, `versions/latest` (PUT), versions create (POST). Paths per existing spec route layout (e.g. `./routes/recipes/list.yaml`, `./routes/recipes/get.yaml`, etc.).
3. **Drizzle schema** — `drizzle/update-schema` (run from `recipes/service/db`):
   - Path to schema file per existing db layout (e.g. `./schemas/recipes.ts` or single `schema.ts` as used by the package).
   - Add tables: `recipes` (id, title, short_description, long_description, is_public, created_by, created_at, updated_by, updated_at), `recipe_versions` (id, recipe_id, content JSON, is_latest, created_by, created_at). Index on (recipe_id, is_latest).
4. **Drizzle queries** — `drizzle/add-query`:
   - Queries for: list recipes (filter by public/admin), get recipe by id, get latest version, create recipe + first version, update recipe metadata, update latest version in place, create new version (transaction: insert + clear previous is_latest), delete recipe.
5. **Express handlers** — `express/add-handler`:
   - Handlers for each recipe route; call db queries; enforce admin for mutations and public-only for non-admin reads.

**Stopping point:** Recipe API works (no notes, files, or menus yet).

---

## Phase 2: Recipe notes — schema, API, DB, handlers

**Goal:** Notes CRUD (list, create, update, delete) for a recipe, with optional link to version.

1. **OpenAPI** — Add schema `RecipeNote`; add routes for notes (list, create, update, delete).
2. **Drizzle** — Add table `recipe_notes` (id, recipe_id, recipe_version_id nullable, body, ever_edited, created_by, created_at, updated_by, updated_at). Add queries.
3. **Express** — Add handlers for note routes; set `ever_edited` on update.

**Stopping point:** Notes API works.

---

## Phase 3: Recipe files — upload/list/delete

**Goal:** Multiple files per recipe; upload (Azure), list, delete. Use SAF file metadata and upload workflows.

1. **OpenAPI** — Add schema `RecipeFileInfo` (or use file metadata shape); add routes for recipe files: list, upload (use **upload** flag), delete by file id.
2. **Drizzle** — `drizzle/update-schema` with **file** flag for table `recipe_files` (id, recipe_id, …fileMetadataColumns, optional uploaded_by). Add queries (list by recipe_id, insert, delete by id).
3. **Express** — `express/add-handler` with **upload** flag for upload route; handlers for list and delete. Wire to Azure/store per workflow.
4. **SDK** — Later in Phase 6, or add here: `sdk/add-query` for list files, `sdk/add-mutation` with **upload** for upload, mutation for delete.

**Stopping point:** Recipe file upload/list/delete works.

---

## Phase 4: Recipe note files

**Goal:** Multiple files per note; same pattern as recipe files.

1. **OpenAPI** — Add schema `RecipeNoteFileInfo`; routes for note files: list, upload (**upload** flag), delete by file id.
2. **Drizzle** — `drizzle/update-schema` with **file** flag for `recipe_note_files` (id, recipe_note_id, …fileMetadataColumns). Add queries.
3. **Express** — Handlers with upload for note files.

**Stopping point:** Note file upload works.

---

## Phase 5: Menus — schema, API, DB, handlers

**Goal:** Menu CRUD with nested groupings (JSON). No separate grouping tables.

1. **OpenAPI** — Add schema `Menu` (groupings as array of `{ name, recipeIds }`, editedByUserIds array). Add routes: list, get, create, update, delete.
2. **Drizzle** — Add table `menus` (id, name, is_public, created_by, created_at, edited_by_user_ids JSON, groupings JSON). Add queries; on update, append current user id to edited_by_user_ids if not present.
3. **Express** — Handlers for menu routes.

**Stopping point:** Menus API works.

---

## Phase 6: SDK — queries and mutations (shared by root and app)

**Goal:** TanStack Query hooks and mutations so both clients can call the API. Shared components for listing/displaying recipes and menus can be added here or in client packages.

1. **Queries** — `sdk/add-query` for: recipes list, recipe get, recipe versions list; notes list; recipe files list, note files list; menus list, menu get.
2. **Mutations** — `sdk/add-mutation` for: recipe create/update/delete, version create, version update latest; note create/update/delete; recipe file upload, recipe file delete; note file upload, note file delete; menu create/update/delete. Use **upload** flag for file upload mutations.
3. **Components** (optional in this phase) — `sdk/add-component` for recipe list item/card and recipe display if we want them shared; otherwise implement in each client.

**Stopping point:** SDK is ready for both clients; API is fully consumable.

---

## Phase 7: Root client (logged-out / public)

**Goal:** Public recipe list, recipe detail, menu list, menu detail. Read-only; no edit UI.

1. **Vue views** — `vue/add-view` (or equivalent for the recipes root app):
   - Public recipe list page.
   - Public recipe detail page (current version, ingredients, instructions, optional notes/files if exposed).
   - Public menu list page.
   - Public menu detail page (groupings, recipe ids with short descriptions from recipe).
2. Use SDK queries only; no mutations. Permission checks: show only public content (same as API enforcement).

**Stopping point:** Logged-out experience is complete.

---

## Phase 8: App client (logged-in)

**Goal:** Full experience for admins (CRUD, versions, notes, files, menus); read-only for non-admins with edit UI hidden.

1. **Vue views** — `vue/add-view`:
   - Recipe list (admin: all; non-admin: public only; hide create for non-admin).
   - Recipe detail/edit page: current version, version history, notes, recipe files, note files; edit metadata; save content as “update latest” or “new version”; upload/delete files. Show edit/version/notes UI only for admin.
   - Menu list (admin: all; non-admin: public; hide create for non-admin).
   - Menu create/edit: name, is_public, groupings (name + ordered recipe ids). Admin only.
2. Use SDK queries and mutations. Gate all mutation UI and create buttons on admin role; non-admin sees same as root (read-only public).

**Stopping point:** Full app works; ready for review and polish.

---

## Workflow reference

- **Backend:** `openapi/add-schema`, `openapi/add-route` (flag: `upload`), `drizzle/update-schema` (flag: `file`), `drizzle/add-query`, `express/add-handler` (flag: `upload`).
- **Frontend:** `sdk/add-query`, `sdk/add-mutation` (flag: `upload`), `sdk/add-component`, `vue/add-view`.

Run `npm exec saf-workflow dry-run ./path/to/workflow.ts` for each workflow to verify wiring; ensure workflows that need to run in a specific package use `CdStepMachine` to change into that directory.
