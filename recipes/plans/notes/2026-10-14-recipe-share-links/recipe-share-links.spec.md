# Recipe Share Links — Feature Specification

## Overview

Add share links so anyone with a recipe’s id can open a read-only view of that recipe. From the recipe detail overflow menu (“Recipe actions”), a **Get share link** item copies a URL that embeds only the recipe id (no secret tokens). The shared page reuses the existing recipe display components (`RecipeContentPreview` and related), but without the app bar, breadcrumbs, or any edit/mutate affordances. Knowing the recipe id is sufficient access; recipes are not treated as high-secrecy resources.

## User Stories

- As a collection member viewing a recipe, I want a **Get share link** action in the recipe actions menu so that I can copy a URL to share the recipe.
- As a collection member, when I click **Get share link**, I want the link placed on my clipboard so that I can paste it elsewhere without leaving the page.
- As a recipient of a share link (logged in or not), I want to open a read-only recipe page by recipe id so that I can view title, subtitle, description, ingredients, instructions, and images.
- As a recipient, I want the shared page to show the recipe content without the app bar, breadcrumbs, or edit/upload/delete controls so that the page is suitable for sharing outside the app shell.

## Packages to Modify

- **recipes/service/spec**: Add OpenAPI route(s) for the unauthenticated shared-recipe read (and shared file blob if needed). Reuse existing `Recipe`, `RecipeVersion`, and `RecipeFileInfo` schemas. Do not overload `GET /recipes/:id`.
- **recipes/service/http**: Handlers for the new public share endpoints; wire them outside (or alongside with `enforceAuth: false`) the authenticated recipes router. Allowlist paths in Caddy `@public_monolith` as needed.
- **recipes/service/sdk**: Query hook(s) for the shared-recipe GET; ensure download URLs from the shared response work for unauthenticated image loads.
- **recipes/clients/links**: Add an app link for the shared recipe page (path keyed by recipe id only — no `collectionId`).
- **recipes/clients/app**: Add **Get share link** to the recipe actions menu in `RecipeDetailContent`; copy absolute share URL to clipboard. Add a shared-recipe route/page that loads via the public API and renders read-only content with no edit tooling.
- **recipes/clients/common** (as needed): Support a layout mode for the share page with no app bar / breadcrumbs (today `AppSpa` always passes `breadcrumb-bar`).
- **recipes/security**: Update `threat-model.md` for the new public API surface; add Playwright coverage for unauthenticated access to the share endpoints.

## Database Schema Updates

None. Share access is capability-by-id using the existing `recipe.id`. No share-token table, expiry, or revoke flag in this iteration.

## Business Objects

No new business objects. Reuse:

1. **Recipe** — existing (`service/spec/schemas/recipe.yaml`).
2. **RecipeVersion** — existing; shared view shows the current/latest version content (ingredients, instructions).
3. **RecipeFileInfo** — existing; include file metadata (and Unsplash attribution when present) so images render on the shared page. In the shared response, `downloadUrl` must point at a publicly reachable blob URL (see API Endpoints).

Keep resources flat and keyed in responses; do not nest versions or files inside `Recipe`.

## API Endpoints

Follow `/saflib/openapi/docs/02-api-design.md`: one URL per distinct action; do not overload authenticated `GET /recipes/:id` with a “public if …” query flag; JSON responses are top-level objects keyed by resource name (never a bare business object or array at the root).

The shared page needs recipe + current version + files for one parent. Return those together from the share GET so the page loader stays a fixed query count (same spirit as batching: avoid N follow-up JSON calls for children of one recipe). File **bytes** remain a separate blob action with its own URL.

1. **GET /recipes/{id}/shared**
   - Purpose: Load a recipe for the public share page by id only (no collection membership, no session).
   - Request parameters: `id` (path) — recipe id.
   - Request body: none.
   - Response `200`:
     ```json
     {
       "recipe": { /* Recipe */ },
       "currentVersion": { /* RecipeVersion */ },
       "files": [ /* RecipeFileInfo[] */ ]
     }
     ```
     `files` is always present (empty array if none). Each `RecipeFileInfo.downloadUrl` must be usable without authentication (see endpoint 2).
   - Error responses: `404` if no recipe with that id; use existing Error schema.
   - Authorization: **None** (public). Anyone who knows the recipe id can read the shared payload. Do not require Kratos session or email verification. Do not reuse `getRecipeAndRequireCollectionAuth` for this path.

2. **GET /recipes/{id}/shared/files/{fileId}/blob**
   - Purpose: Serve file bytes for images (and other attachments) shown on the shared page. Distinct from authenticated `GET /recipes/{id}/files/{fileId}/blob` so public surface and Caddy allowlisting stay explicit and the authenticated blob route’s auth model is unchanged.
   - Request parameters: `id` (recipe id), `fileId` (file id).
   - Request body: none.
   - Response `200`: binary body with appropriate `Content-Type` (same behavior as the existing blob handler).
   - Error responses: `404` if recipe or file missing, or file does not belong to that recipe.
   - Authorization: **None** (public). Shared GET responses must set `downloadUrl` to this path (API base + `/recipes/{id}/shared/files/{fileId}/blob`), not the authenticated blob path.

Do **not** add list/search/batch share endpoints in this iteration; only a single-recipe share view is required.

Mutating routes (`PUT`/`DELETE` recipes, versions, files, etc.) remain authenticated and collection-authorized as today.

## Frontend Pages

1. **Recipe detail (existing) — menu affordance**
   - Purpose: Let members copy a share URL while viewing a recipe.
   - Location: Recipe actions overflow menu (`mdi-dots-vertical`) in `clients/app/components/recipe-detail/RecipeDetailContent.vue` (used by standalone recipe detail and menu-context recipe detail).
   - Key features: New list item **Get share link** (available to anyone who can open the recipe detail page — not limited to editors/owners). Place it with the always-visible actions (e.g. near Version history), not behind `showEdit`.
   - User interactions: On click, write the absolute shared-page URL (from `appLinks` + recipe id) to the clipboard. Brief success feedback (e.g. snackbar “Link copied”) is desirable; no navigation away from the page.

2. **Shared recipe page (new)**
   - Purpose: Public, read-only recipe view opened from a share link.
   - Route: App SPA path with recipe id only (e.g. `/share/recipes/:id` via `recipes/clients/links`). Outside `/c/:collectionId/...` — no collection in the URL.
   - Key features:
     - Load data with the public `GET /recipes/{id}/shared` hook (no `useKratosSession` / profile gate).
     - Render with existing display components (`RecipeContentPreview` / equivalent), including images via shared blob URLs and Unsplash attribution when present.
     - **No** app bar, **no** breadcrumbs, **no** recipe actions menu, **no** edit / upload / Unsplash / delete / version-history entry points.
   - User interactions: View-only (expand image if that already exists on the preview is fine). 404/not-found UI when the id is unknown.

## Security Model Updates

- **New or changed public surface:** Add to Caddy `@public_monolith` (and `threat-model.md` public API list):
  - `GET /recipes/{id}/shared`
  - `GET /recipes/{id}/shared/files/{fileId}/blob`
  These skip Kratos `forward_auth`. The share SPA route is client-side only; API access is what must be allowlisted.
- **Authorization:** Share endpoints are intentionally unauthenticated. Possession of the opaque recipe id (and file id for blobs) is the access check. Authenticated `GET /recipes/{id}`, `GET /recipes/{id}/files`, and `GET /recipes/{id}/files/{fileId}/blob` keep existing collection membership + email-verification requirements. No new roles or authz tags.
- **Data:** No new PII collected. Shared responses expose existing recipe content (title, subtitle, description, ingredients, instructions, images, audit ids already on `Recipe`). Recipients need not be collection members. Retention unchanged (live recipe rows).
- **Integrations and secrets:** None new. No share-token secrets.
- **File handling:** Recipe image/file bytes become fetchable without a session via the **shared** blob path only. Authenticated blob path remains protected. Shared page must render Unsplash attribution when `unsplashAttribution` is present (same rule as authenticated detail).
- **New tests:** Security Playwright (or HTTP integration) coverage that:
  - Unauthenticated `GET /recipes/{id}/shared` returns 200 for an existing recipe and 404 for unknown id.
  - Unauthenticated `GET /recipes/{id}/shared/files/{fileId}/blob` returns 200 for a file on that recipe.
  - Unauthenticated `GET /recipes/{id}` and `GET /recipes/{id}/files/{fileId}/blob` still fail auth (401) — public access must not bleed onto the authenticated routes.
  - CSRF not required for these GETs (document in threat model if the suite asserts public GET behavior).

## Future Enhancements / Out of Scope

- Secret/unguessable share tokens, link expiry, or per-link revoke.
- “Make public / private” toggle distinct from share-by-id (share-by-id is always on for every recipe in this iteration).
- Sharing menus or collections via the same mechanism.
- Password-protected or time-limited share pages.
- Open Graph / social preview metadata for share links.
- Copy feedback beyond a simple clipboard write + lightweight toast (rich share sheet, native Web Share API).

## Questions and Clarifications

None blocking. Product intent is explicit: id-only links, clipboard copy from the recipe actions menu, and a stripped-down shared page reusing recipe display components.
