# Recipes Init — Implementation Plan (Milestone-based)

This plan breaks the spec into **milestones** that alternate backend and frontend work so you get testable user experiences early. Run workflows from **recipes/plans** so `Cd` paths resolve. After each workflow, you have a testable stopping point.

---

## Phase 1: Recipes backend (core)

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Recipe CRUD + versioning API (list, get, create, update metadata, delete; versions list; update latest in place; create new version). Often run in three parts (1, 1b, 1c) to keep context manageable.

**Workflows:** `recipes-init-phase-1.workflow.ts`, `recipes-init-phase-1b.workflow.ts`, `recipes-init-phase-1c.workflow.ts`.

**Stopping point:** Recipe API works (no notes, files, or menus yet).

---

## Milestone 1: Recipes frontend

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

**Workflow:** `recipes-init-phase-2.workflow.ts` (same as current Phase 2).

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

**Workflow:** `recipes-init-phase-3.workflow.ts` (same as current Phase 3).

**Stopping point:** Recipe file API works.

### M3b — Recipe files frontend

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for recipe files (queries + upload/delete mutations); app recipe detail: manage recipe files (list, upload, delete). Admin only.

**Workflow:** `recipes-init-m3b-recipe-files-frontend.workflow.ts`.

**Stopping point:** Admins can manage recipe files in the app.

---

## Milestone 4: Note files

### M4a — Note files backend

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Multiple files per note; list, upload, delete. Same pattern as recipe files.

**Workflow:** `recipes-init-phase-4.workflow.ts` (same as current Phase 4).

**Stopping point:** Note file API works.

### M4b — Note files frontend

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for note files; app recipe detail: manage files per note (list, upload, delete per note). Admin only.

**Workflow:** `recipes-init-m4b-note-files-frontend.workflow.ts`.

**Stopping point:** Admins can manage files on notes in the app.

---

## Milestone 5: Menus

### M5a — Menus backend

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Menu CRUD API with nested groupings (JSON). No separate grouping tables; `editedByUserIds` appended on update.

**Workflow:** `recipes-init-phase-5.workflow.ts` (same as current Phase 5).

**Stopping point:** Menus API works.

### M5b — Menus logged-in (App)

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for menus (queries + mutations); app client: menu list (admin sees all, non-admin public; hide create for non-admin), menu create/edit (name, is_public, groupings with name + ordered recipe ids). Admin only for create/edit.

**Workflow:** `recipes-init-m5b-menus-app.workflow.ts`.

**Stopping point:** Admins can create and edit menus in the app.

### M5c — Menus logged-out (Root)

**Packages:** `recipes/service/sdk`, `recipes/clients/root`.

**Goal:** SDK menu components first (add-component), then root menu list and detail views — same pattern as M1b. Shared menu display lives in SDK so app can reuse.

**Workflow:** `recipes-init-m5c-menus-root.workflow.ts`.

**Component-first flow:** (1) Create **menu preview** component in SDK (one menu for list/card). (2) Create **menu detail** component in SDK (full menu with groupings and recipe lines). (3) Add root menu list page; (4) Add root menu detail page.

**Interface sketch (avoid recipe-preview-style gaps):**

- **Menu preview** (list item): Accept the full **Menu** as a prop: `menu: { id, name, isPublic, groupings?: { name, recipeIds }[] }`. No need for resolved recipe data on the list item; optional groupings for e.g. “3 sections” or similar.
- **Menu detail** (full display): Accept the **entire structure needed to render** — no “just ids” or “just markdown.” Prefer a single prop such as:
  - `menuDetail: { id, name, isPublic, groupings: { name, recipes: { id, title, shortDescription }[] }[] }`
  so each grouping has an ordered array of **resolved recipe display items** (id, title, shortDescription). The page/loader is responsible for fetching the menu (GET /menus/:id) and resolving recipe summaries (from API or local lookup); the component only receives this fully resolved shape. That way the menu detail component does not need to fetch or accept a separate map of recipe id → summary.

**Stopping point:** Logged-out users can browse public menus; full app is complete.

---

## Workflows summary

| Workflow file | Scope | Packages |
|---------------|--------|----------|
| **recipes-init.workflow.ts** | Orchestrator: runs all below in order | — |
| **recipes-init-phase-1.workflow.ts** | Recipes backend (spec) | service/spec |
| **recipes-init-phase-1b.workflow.ts** | Recipes backend (db) | service/db |
| **recipes-init-phase-1c.workflow.ts** | Recipes backend (http) | service/http |
| **recipes-init-m1a-app-recipes.workflow.ts** | SDK recipes + App list/detail/edit/delete | service/sdk, clients/app |
| **recipes-init-m1b-root-recipes.workflow.ts** | Root recipe list + detail, refactor to SDK | clients/root, service/sdk |
| **recipes-init-m1c-versions.workflow.ts** | App version history | clients/app |
| **recipes-init-phase-2.workflow.ts** | Notes backend | service/spec, db, http |
| **recipes-init-m2b-notes-frontend.workflow.ts** | SDK notes + App notes section | service/sdk, clients/app |
| **recipes-init-phase-3.workflow.ts** | Recipe files backend | service/spec, db, http |
| **recipes-init-m3b-recipe-files-frontend.workflow.ts** | SDK recipe files + App UI | service/sdk, clients/app |
| **recipes-init-phase-4.workflow.ts** | Note files backend | service/spec, db, http |
| **recipes-init-m4b-note-files-frontend.workflow.ts** | SDK note files + App UI | service/sdk, clients/app |
| **recipes-init-phase-5.workflow.ts** | Menus backend | service/spec, db, http |
| **recipes-init-m5b-menus-app.workflow.ts** | SDK menus + App list/edit | service/sdk, clients/app |
| **recipes-init-m5c-menus-root.workflow.ts** | SDK menu-preview + menu-detail, then root list + detail | service/sdk, clients/root |

- **Full run:** `npm exec saf-workflow run processes/spec-project recipes-init` (or run the orchestrator workflow).
- **Single workflow:** e.g. `npm exec saf-workflow run ./notes/2026-02-20-recipes-init/recipes-init-m1a-app-recipes.workflow.ts`.
- **Dry-run:** `npm exec saf-workflow dry-run ./notes/2026-02-20-recipes-init/recipes-init.workflow.ts`.

The old Phase 6–8 workflows (6a, 6b, 7, 8a, 8b, 8c) are superseded by the milestone-based workflows above; SDK and views are added incrementally per milestone.

---

## Workflow reference

- **Backend:** `openapi/add-schema`, `openapi/add-route` (flag: `upload`), `drizzle/update-schema` (flag: `file`), `drizzle/add-query`, `express/add-handler` (flag: `upload`).
- **Frontend:** `sdk/add-query`, `sdk/add-mutation` (flag: `upload`), `sdk/add-component`, `vue/add-view`.
