# Menus — Implementation Plan

This plan breaks the spec into milestones so each step is a testable stopping point. Run workflows from **recipes/plans**. Use straight ASCII quotes in this doc so search-and-replace works reliably later.

See [menus.spec.md](./menus.spec.md) for the full spec.

---

## Milestone 1 — Menus backend (spec + db + http)

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Menu resource: OpenAPI schema (Menu business object with collectionId, name, isPublic, groupings, editedByUserIds, etc.) and routes: GET /menus (query collectionId), GET /menus/:id (query collectionId), POST /menus (body: collectionId, name, isPublic, groupings), PUT /menus/:id (body: collectionId, name, isPublic, groupings), DELETE /menus/:id (query or body collectionId). DB: `menu` table (id, collection_id, name, is_public, created_by, created_at, updated_by, updated_at, edited_by_user_ids JSON, groupings JSON); migration. HTTP: handlers for all menu endpoints; require collectionId; enforce at least viewer on collection, editor/owner for mutations; validate recipeIds in groupings belong to the same collection; on PUT append current user id to editedByUserIds if not present.

**Workflows:** Split into spec, db, http (e.g. menus-m1-spec, menus-m1-db, menus-m1-http) to keep context manageable.

**Stopping point:** Menu CRUD API works; callers can list/get/create/update/delete menus with collectionId and correct auth; recipeIds in groupings validated against collection.

---

## Milestone 2 — Menus frontend (app)

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for menus (list menus, get menu, create/update/delete menu) with collectionId. App: menu list under `/c/:collectionId/menus`, create menu, edit menu (groupings: name + ordered recipe ids; recipes from same collection); display short description from recipe. Entry from collection-scoped app nav or collection home. No root public menu list/detail in this milestone (can add in M3 if desired).

**Workflow:** menus-m2-menus-frontend.workflow.ts (or split SDK vs page if desired).

**Stopping point:** User can open Menus within a collection, list menus, create a menu with groupings, edit/delete; recipe assignment and display use collection-scoped recipes.

---

## Milestone 3 (optional) — Root app: public menu list and detail

**Packages:** `recipes/service/http`, `recipes/service/sdk`, `recipes/clients/root`.

**Goal:** If we want public menus on the logged-out site: extend GET /menus to accept publicOnly (no collectionId) and return all public menus; GET /menus/:id without collectionId for public detail. Root client: public menu list page, public menu detail with groupings and recipe short descriptions, links to public recipe detail.

**Workflow:** menus-m3-root-public-menus.workflow.ts.

**Stopping point:** Root app shows public menu list and public menu detail; backend supports publicOnly list and public-by-id get for menus.

---

## Workflows summary

| Workflow file | Scope |
|---------------|--------|
| menus.workflow.ts | Orchestrator: runs M1–M2 (and M3 if implemented) in order |
| menus-m1-spec.workflow.ts | Menu OpenAPI schema and routes (GET/POST /menus, GET/PUT/DELETE /menus/:id; collectionId) |
| menus-m1-db.workflow.ts | menu table (collection_id, name, is_public, groupings JSON, edited_by_user_ids JSON, etc.); migration |
| menus-m1-http.workflow.ts | Menu handlers; collectionId required; collection role checks; recipeIds-in-collection validation; editedByUserIds append on PUT |
| menus-m2-menus-frontend.workflow.ts | SDK menu queries/mutations + Menus page (list, create, edit) under /c/:collectionId/menus |
| menus-m3-root-public-menus.workflow.ts | (Optional) GET /menus?publicOnly=true, GET /menus/:id (public); root app public menu list and detail |

- **Run one:** `npm exec saf-workflow run ./notes/2026-03-13-menus/menus-m1-spec.workflow.ts` (etc.).
- **Dry-run orchestrator:** `npm exec saf-workflow dry-run ./notes/2026-03-13-menus/menus.workflow.ts`.

---

## Workflow reference

- **Backend:** `openapi/add-schema`, `openapi/add-route`, `drizzle/update-schema`, `drizzle/add-query`, `express/add-handler`. Menu routes use collectionId in query (GET) or body (POST/PUT/DELETE); follow existing recipe/collection patterns.
- **Frontend:** `sdk/add-query`, `sdk/add-mutation`, `vue/add-view`. Routes under `/c/:collectionId/menus`; loaders pass collectionId to API.
