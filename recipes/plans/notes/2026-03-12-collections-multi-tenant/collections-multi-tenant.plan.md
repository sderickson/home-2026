# Collections & Multi-Tenant — Implementation Plan

This plan breaks the spec into milestones so each step is a testable stopping point. Run workflows from **recipes/plans**. Use straight ASCII quotes in this doc so search-and-replace works reliably later.

See [collections-multi-tenant.spec.md](./collections-multi-tenant.spec.md) for the full spec.

---

## Milestone 1 — Collections backend (spec + db + http)

**Packages:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http`.

**Goal:** Collection and collection_member resources: OpenAPI schemas and routes (GET/POST /collections, GET/PUT/DELETE /collections/:id, GET/POST/PUT/DELETE /collections/:id/members and /members/:memberId). DB: `collection` and `collection_member` tables; add `collection_id` to `recipe` (required for new rows); migration (no backfill). HTTP: handlers for all collection and member endpoints; enforce owner/editor/viewer and validated-email (creator excepted); forbid delete collection if it has recipes; forbid remove/demote creator.

**Workflows:** Split into spec, db, http (e.g. collections-m1-spec, collections-m1-db, collections-m1-http) to keep context manageable.

**Stopping point:** Collection and member CRUD API works; recipe table has collection_id; callers can list/create/update/delete collections and members with correct auth and constraints.

---

## Milestone 2 — Collections frontend

**Packages:** `recipes/service/sdk`, `recipes/clients/app`.

**Goal:** SDK for collections and members (list collections, get/create/update/delete collection, list/add/update/remove members). Single Collections page: list collections user is in, link to enter at `/c/:collectionId/recipes/list`, "Create collection" (POST with optional id); for each collection row, owners can open a dialog to view/add/remove members and change roles (creator cannot be removed or demoted). No separate settings page.

**Workflow:** collections-m2-collections-frontend.workflow.ts (or split SDK vs page if desired).

**Stopping point:** User can open Collections, see their collections, create one (with optional id), and as owner manage members in a dialog.

---

## Milestone 3 — Recipe scoping backend (required collectionId, flat API paths)

**Packages:** `recipes/service/spec`, `recipes/service/http`.

**Goal:** Keep existing recipe API paths (no `/c/:collectionId/` prefix). Add required `collectionId` as query param (for GET/list) or request body property (for POST). For GET /recipes, GET /recipes/:id, POST /recipes, PUT /recipes/:id, DELETE /recipes/:id and all nested routes (versions, notes, files, note-files): require collectionId and verify the resource belongs to that collection; enforce at least viewer on collection (validated email unless creator), editor/owner for mutations. Return 400 when collectionId is missing.

**Workflow:** collections-m3-recipe-scoping-backend.workflow.ts.

**Stopping point:** All recipe endpoints require collectionId (query or body); scope and permissions enforced; API paths stay flat.

---

## Milestone 4 — Recipe scoping frontend (routes, links, breadcrumbs)

**Packages:** `recipes/links`, `recipes/clients/app`, `recipes/service/sdk`.

**Goal:** App links and router: all recipe list/detail/create/edit paths under `/c/:collectionId/...` (e.g. `/c/:collectionId/recipes/list`, `/c/:collectionId/recipes/:id`). Update SDK usage so every recipe query/mutation includes collectionId (from route param). Breadcrumbs: show collection name instead of generic "recipes". Entry: from Collections page, user clicks into a collection and lands on recipe list for that collection. Existing recipe list/detail/create/edit pages become collection-scoped (same components, new routes and loaders).

**Workflow:** collections-m4-recipe-scoping-frontend.workflow.ts.

**Stopping point:** Full flow: Collections page -> pick collection -> recipe list under /c/:id/recipes/list -> detail/create/edit under /c/:id/...; breadcrumbs show collection name; all API calls pass collectionId (query or body) to existing flat endpoints.

---

## Workflows summary

| Workflow file | Scope |
|---------------|--------|
| collections-multi-tenant.workflow.ts | Orchestrator: runs M1–M4 in order |
| collections-m1-spec.workflow.ts | Collections + members OpenAPI schemas and routes |
| collections-m1-db.workflow.ts | collection, collection_member tables; recipe.collection_id; migration |
| collections-m1-http.workflow.ts | Collection and member handlers; auth and constraint logic |
| collections-m2-collections-frontend.workflow.ts | SDK collections/members + Collections page + membership dialog |
| collections-m3-recipe-scoping-backend.workflow.ts | Required collectionId (query/body) on recipe endpoints; scope + permissions |
| collections-m4-recipe-scoping-frontend.workflow.ts | Links, router, breadcrumbs, loaders under /c/:collectionId/; pass collectionId to API |

- **Run one:** `npm exec saf-workflow run ./notes/2026-03-12-collections-multi-tenant/collections-m1-spec.workflow.ts` (etc.).
- **Dry-run orchestrator:** `npm exec saf-workflow dry-run ./notes/2026-03-12-collections-multi-tenant/collections-multi-tenant.workflow.ts`.

---

## Workflow reference

- **Backend:** `openapi/add-schema`, `openapi/add-route`, `drizzle/update-schema`, `drizzle/add-query`, `express/add-handler`. For collection id on create, route accepts optional `id` in body.
- **Frontend:** `sdk/add-query`, `sdk/add-mutation`, `vue/add-view`. Links use `:collectionId` in path; router and loaders pass it through.
