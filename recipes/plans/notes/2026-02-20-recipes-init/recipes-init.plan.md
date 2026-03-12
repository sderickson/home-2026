# Recipes Init — Implementation Plan (Milestone-based)

This plan breaks the spec into **milestones** that alternate backend and frontend work so you get testable user experiences early. Run workflows from **recipes/plans** so `Cd` paths resolve. After each workflow, you have a testable stopping point.

---

## Milestone 1 — Recipes backend

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Recipe CRUD + versioning API (list, get, create, update metadata, delete; versions list; update latest in place; create new version). Run in three workflows (spec, db, http) to keep context manageable.

**Workflows:** `recipes-init-m1-spec.workflow.ts`, `recipes-init-m1-db.workflow.ts`, `recipes-init-m1-http.workflow.ts`.

**Stopping point:** Recipe API works (no notes, files, or menus yet).

---

## Milestone 1 — Recipes frontend

Backend is done; no new backend work. Three workflows for the recipe user experience.

### M1a — Logged-in experience (SDK + App)

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for recipes (queries + mutations) and app client: recipe list, recipe detail (read), create recipe, edit recipe (metadata + content with “update latest” vs “save as new version”), delete recipe. Admin sees all; non-admin sees public only; hide create/edit/delete for non-admin.

**Workflow:** `recipes-init-m1a-app-recipes.workflow.ts`.

**Stopping point:** Logged-in admin can list, create, edit, and delete recipes.

### M1b — Logged-out experience (Root + SDK)

**Packages:** `recipes/clients/root`, `recipes/service/sdk`.

**Goal:** Public recipe list and recipe detail pages in root client. After each page, refactor shared listing/display logic into `recipes/service/sdk` (e.g. `sdk/add-component`) so the app client can reuse it.

**Workflow:** `recipes-init-m1b-root-recipes.workflow.ts`.

**Stopping point:** Logged-out users can browse public recipes; shared components live in SDK.

### M1c — Version history (App)

**Packages:** `recipes/clients/app`.

**Goal:** On recipe detail, add version history section: list versions, optionally diff/compare. Admin only. Uses existing SDK and API.

**Workflow:** `recipes-init-m1c-versions.workflow.ts`.

**Stopping point:** Admins can see recipe version history in the app.

---

## Milestone 2: Notes

### M2a — Notes backend

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Notes CRUD API (list, create, update, delete) for a recipe; optional link to version; `ever_edited` on update.

**Workflow:** `recipes-init-m2a-notes-backend.workflow.ts`.

**Stopping point:** Notes API works.

### M2b — Notes frontend

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for notes (queries + mutations); app recipe detail: notes section (list, add, edit note with ever_edited, optional version link). Admin only.

**Workflow:** `recipes-init-m2b-notes-frontend.workflow.ts`.

**Stopping point:** Admins can manage notes on a recipe in the app.

---

## Milestone 3: Recipe files

### M3a — Recipe files backend

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Multiple files per recipe; list, upload (Azure), delete. Use SAF file metadata and upload workflows.

**Workflow:** `recipes-init-m3a-recipe-files-backend.workflow.ts`.

**Stopping point:** Recipe file API works.

### M3b — Recipe files frontend

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for recipe files (queries + upload/delete mutations); app recipe detail: manage recipe files (list, upload, delete). Admin only.

**Workflow:** `recipes-init-m3b-recipe-files-frontend.workflow.ts`.

**Stopping point:** Admins can manage recipe files in the app.

### M3c — Recipe files visible (serve endpoint + Root)

**Packages:** `recipes/service/spec`, `recipes/service/http`, `recipes/clients/root`.

**Goal:** Add recipe file serve endpoint GET /recipes/:id/files/:fileId/blob (route + handler, binary response; Content-Disposition per purpose). So GET .../files/:fileId can later return JSON RecipeFileInfo if desired. Update _helpers.ts so recipeFileToApiRecipeFile includes downloadUrl pointing to the /blob endpoint. Make recipe files visible on the public recipe detail page using filesListRecipesQuery; display each file via its downloadUrl. No SDK mutation — list response includes downloadUrl.

**Workflow:** `recipes-init-m3c-recipe-files-visible.workflow.ts`.

**Stopping point:** Serve endpoint exists; list returns downloadUrl; logged-out users can see (and view) recipe files on the public recipe detail page.

---

## Milestone 4: Note files

### M4a — Note files backend

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Multiple files per note; list, upload, delete, and GET .../files/:fileId/blob to serve file binary. Update _helpers so the note file list mapper includes downloadUrl. Same pattern as recipe files (M3a + blob from M3c).

**Workflow:** `recipes-init-m4a-note-files-backend.workflow.ts`.

**Stopping point:** Note file API works (including blob serve and downloadUrl in list).

### M4b — Note files frontend

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for note files; app recipe detail: manage files per note (list, upload, delete per note). Use downloadUrl from list for viewing/displaying files. Admin only.

**Workflow:** `recipes-init-m4b-note-files-frontend.workflow.ts`.

**Stopping point:** Admins can manage files on notes in the app.

**Init scope:** The recipes-init implementation ends at M4b. Menus (M5) were not implemented.

---

## Workflows summary

| Workflow file | Scope | Packages |
|---------------|--------|----------|
| **recipes-init.workflow.ts** | Orchestrator: runs all below in order | — |
| **recipes-init-m1-spec.workflow.ts** | Recipes backend (spec) | service/spec |
| **recipes-init-m1-db.workflow.ts** | Recipes backend (db) | service/db |
| **recipes-init-m1-http.workflow.ts** | Recipes backend (http) | service/http |
| **recipes-init-m1a-app-recipes.workflow.ts** | SDK recipes + App list/detail/edit/delete | service/sdk, clients/app |
| **recipes-init-m1b-root-recipes.workflow.ts** | Root recipe list + detail, refactor to SDK | clients/root, service/sdk |
| **recipes-init-m1c-versions.workflow.ts** | App version history | clients/app |
| **recipes-init-m2a-notes-backend.workflow.ts** | Notes backend | service/spec, db, http |
| **recipes-init-m2b-notes-frontend.workflow.ts** | SDK notes + App notes section | service/sdk, clients/app |
| **recipes-init-m3a-recipe-files-backend.workflow.ts** | Recipe files backend | service/spec, db, http |
| **recipes-init-m3b-recipe-files-frontend.workflow.ts** | SDK recipe files + App UI | service/sdk, clients/app |
| **recipes-init-m3c-recipe-files-visible.workflow.ts** | Recipe file serve (route + handler + downloadUrl in _helpers) + Root show files | service/spec, http, clients/root |
| **recipes-init-m4a-note-files-backend.workflow.ts** | Note files backend | service/spec, db, http |
| **recipes-init-m4b-note-files-frontend.workflow.ts** | SDK note files + App UI | service/sdk, clients/app |

- **Full run:** `npm exec saf-workflow run processes/spec-project recipes-init` (or run the orchestrator workflow).
- **Single workflow:** e.g. `npm exec saf-workflow run ./notes/2026-02-20-recipes-init/recipes-init-m1a-app-recipes.workflow.ts`.
- **Dry-run:** `npm exec saf-workflow dry-run ./notes/2026-02-20-recipes-init/recipes-init.workflow.ts`.

---

## Workflow reference

- **Backend:** `openapi/add-schema`, `openapi/add-route` (flag: `upload`), `drizzle/update-schema` (flag: `file`), `drizzle/add-query`, `express/add-handler` (flag: `upload`).
- **Frontend:** `sdk/add-query`, `sdk/add-mutation` (flag: `upload`), `sdk/add-component`, `vue/add-view`.
