# Collections & Multi-Tenant — Product & Technical Specification

## Overview

Introduce **collections** as a first-class resource. A collection has a name and a list of members (by email) with roles: **owner**, **editor**, or **viewer**. The person who creates a collection is automatically a **permanent owner** (cannot be removed or demoted). All recipes, notes, and files are scoped to a collection. Members must have a **validated email** to access a collection they're in—except the creator, who always has access. Existing endpoints and pages are updated to operate in collection context: URLs are under `/c/<collection-id>/`, permission checks use the collection’s member list and roles, and breadcrumbs show the collection name instead of a generic “recipes” label. This extends the identity and permission model so that multiple users can own, edit, or view a full collection (not just a single global admin pool).

## User Stories

- As a user, I want to create a collection with a name and (optionally) choose its id so that I can have stable, shareable URLs.
- As the creator of a collection, I am automatically a permanent owner and cannot be removed or demoted.
- As an owner, I want to add other users by email with owner/editor/viewer so that we can collaborate or share read-only access.
- As an owner, I want to remove members or change their role from a dialog on the collections page; the creator cannot be removed or demoted.
- As an editor, I want to create and edit recipes and notes in the collection so that I can contribute.
- As a viewer, I want to see recipes in the collection in read-only form so that I can use shared content.
- As a user with a validated email (or as the creator), I want to access collections I’m a member of; unvalidated members cannot access until their email is validated.
- As a user, I want one collections page where I see all collections I’m part of and, if I’m an owner, edit membership in a dialog for that collection.
- As a user, I want all recipe URLs under `/c/<collection-id>/` so that the current collection is always clear and shareable.

## Packages to Modify

- **recipes/service/spec**: Add OpenAPI schemas and routes for collections and collection members; update existing recipe route paths to be collection-scoped.
- **recipes/service/db**: Add `collection` and `collection_member` tables; add `collection_id` to `recipe` (required for new recipes); migrations. No backfill—product not launched, scorched earth.
- **recipes/service/http**: Add handlers for collection and member CRUD; add collection-scoped handlers for recipes, notes, files; enforce permission checks (owner/editor/viewer) per collection and validated-email rule (creator excepted).
- **recipes/service/sdk**: Add API client and types for collections and members; update existing requests to take collection id; shared components that accept collection context.
- **recipes/clients/app**: Routes under `/c/:collectionId/`; single collections page (list all + owner membership dialog); breadcrumbs use collection name; all loaders/mutations pass collection id and respect permissions.
- **recipes/clients/root**: If public content is still shown, either scope by collection (e.g. public collection view) or retain a global public list; align with product decision for “public” vs “collection-scoped public.”
- **recipes/links**: Update app (and root if needed) link definitions so paths use `/c/:collectionId/...`.

## Database Schema Updates

- **collection**: id (user-specified on creation; URL-safe, unique), name, created_by, created_at, updated_at. Singular table name.
- **collection_member**: id, collection_id (FK), email (string), role (`owner` | `editor` | `viewer`), is_creator (boolean), created_at. One row per (collection, email); unique on (collection_id, email). Only owners can mutate members; application logic forbids removing or demoting the creator (permanent owner).
- **recipe**: Add `collection_id` (FK to collection, required for new rows). Migration: add column; existing rows can be dropped or left null and excluded from collection-scoped queries—no backfill (product not launched, scorched earth).

Indexes: collection_member(collection_id), collection_member(email) for “collections I’m in”; recipe(collection_id) for listing by collection.

## Business Objects

1. **Collection**
   - Description: A named container for recipes, with access controlled by members. Id is user-specified on creation for stable URLs.
   - Properties: id, name, createdBy, createdAt, updatedAt.

2. **CollectionMember**
   - Description: One member of a collection with a role. Creator is permanent owner (isCreator true); cannot be removed or demoted.
   - Properties: id, collectionId, email, role (`owner` | `editor` | `viewer`), isCreator (boolean), createdAt.

3. **Recipe** (updated)
   - Add collectionId. Responses include collectionId when in collection context.

Existing business objects (RecipeVersion, RecipeNote, RecipeFileInfo, RecipeNoteFileInfo) are reached via recipe or note; they are scoped by collection implicitly through the recipe they belong to.

## API Endpoints

### Collections

1. **GET /collections**
   - Purpose: List collections the current user is a member of (any role).
   - Response: `{ collections: Collection[] }`.
   - Authorization: Authenticated; returns only collections where the user’s email is in collection_member and (user's email is validated **or** user is the collection creator). Unvalidated non-creators do not see the collection.

2. **POST /collections**
   - Purpose: Create a collection; caller becomes the sole owner and creator (insert into collection_member with role owner, is_creator true). Id can be specified for stable URLs.
   - Request body: name, id (optional; if provided, must be URL-safe and unique; if omitted, server generates one).
   - Response: `{ collection: Collection }`.
   - Authorization: Authenticated.

3. **GET /collections/:id**
   - Purpose: Get one collection by id.
   - Response: `{ collection: Collection }`.
   - Authorization: Caller must be a member (any role) and have validated email—unless caller is the collection creator (creator always has access).

4. **PUT /collections/:id**
   - Purpose: Update collection name.
   - Request body: name.
   - Response: `{ collection: Collection }`.
   - Authorization: Owner only.

5. **DELETE /collections/:id**
   - Purpose: Delete collection. Forbidden if the collection has any recipes (return 409 or 400 with clear message). Only allowed when collection has no recipes.
   - Authorization: Owner only.

### Collection members

6. **GET /collections/:id/members**
   - Purpose: List members of a collection (email + role + isCreator).
   - Response: `{ members: CollectionMember[] }`.
   - Authorization: Member (any role); validated-email rule applies (creator excepted).

7. **POST /collections/:id/members**
   - Purpose: Add a member (or update role if email already exists). Request body: email, role (owner | editor | viewer).
   - Response: `{ member: CollectionMember }`.
   - Authorization: Owner only.

8. **PUT /collections/:id/members/:memberId**
   - Purpose: Update a member’s role (e.g. editor → viewer).
   - Request body: role.
   - Response: `{ member: CollectionMember }`.
   - Authorization: Owner only. Constraint: cannot demote the creator (permanent owner); creator's role is fixed as owner.

9. **DELETE /collections/:id/members/:memberId**
   - Purpose: Remove a member from the collection.
   - Authorization: Owner only. Constraint: cannot remove the creator (permanent owner); return 400 or 409 if attempted.

### Collection-scoped recipe endpoints

All existing recipe endpoints are re-scoped under the collection. Use **path prefix** `/c/:collectionId/recipes`, `/c/:collectionId/recipes/:id`, etc. Permission: caller must have at least viewer on the collection (and validated email unless creator); mutations require editor or owner.

- **GET /c/:collectionId/recipes** — List recipes in this collection. Response: `{ recipes: Recipe[] }`. Authorization: at least viewer on collection. Filter: only recipes where recipe.collection_id = collectionId (and optionally public/private as today).
- **GET /c/:collectionId/recipes/:id** — Get recipe; must belong to this collection (recipe.collection_id = collectionId). Authorization: at least viewer.
- **POST /c/:collectionId/recipes** — Create recipe in this collection (set recipe.collection_id = collectionId). Authorization: editor or owner.
- **PUT /c/:collectionId/recipes/:id** — Update recipe; must belong to this collection. Authorization: editor or owner.
- **DELETE /c/:collectionId/recipes/:id** — Delete recipe; must belong to this collection. Authorization: editor or owner.
- Similarly: **GET/POST/PUT/DELETE** for versions, notes, files, note-files under `/c/:collectionId/recipes/:id/...`.
  Legacy **unscoped** endpoints (e.g. GET /recipes without collectionId) can be deprecated or removed: list could return 400 “collectionId required” or redirect to “pick a collection.” Spec recommends: **all recipe API usage goes through `/c/:collectionId/...`**; no query params for collection.

Error responses: 400 validation, 401 unauthenticated, 403 forbidden (e.g. not a member or insufficient role), 404 not found (collection or resource not in collection). Use existing Error schema where applicable.

## Frontend Pages

### App (logged-in)

1. **Collections** (single page, e.g. path: `/collections` or `/c`)
   - Purpose: View all collections the user is a member of; open a collection to work in it; if owner, manage membership from a dialog per collection.
   - Key features: List collections (name, role); link to enter at `/c/:collectionId/recipes/list`; "Create collection" → POST /collections (with optional id) then redirect; for each collection, owners can open a dialog to view/add/remove members and change roles (creator cannot be removed or demoted). No separate settings/members page—membership editing is in-dialog on this page.

2. **Collection-scoped recipe list** (path: `/c/:collectionId/recipes/list`)
   - Purpose: List recipes for this collection only. Replaces current “recipes list” when in collection context.
   - Key features: Loader calls GET /c/:collectionId/recipes; breadcrumb shows collection name (e.g. “My Kitchen” instead of “recipes”); create/edit/delete gated by editor/owner role.

3. **Collection-scoped recipe detail** (path: `/c/:collectionId/recipes/:id`)
   - Purpose: View/edit one recipe in the collection. Same as current detail but URL includes collectionId; breadcrumb: collection name → recipe title.

4. **Collection-scoped recipe create/edit** (paths: `/c/:collectionId/recipes/create`, `/c/:collectionId/recipes/:id/edit`)
   - Purpose: Create or edit recipe in this collection. Loader/mutations use collectionId.

All app routes that currently live under `/recipes/...` move under `/c/:collectionId/...`. Breadcrumbs use the collection name instead of a generic "recipes" label. Root client (public) may remain at a global public list or be updated to something like “public collection” view; spec leaves that to product (see Out of Scope).

## Migration

- Migration adds `collection` and `collection_member` tables and adds `collection_id` (required for new rows) to `recipe`.
- No backfill strategy—product not launched; scorched earth. Existing recipe rows can be dropped or left with null `collection_id` and excluded from collection-scoped queries.

## Future Enhancements / Out of Scope

- Public root site behavior when multiple collections exist (e.g. single “public collection” vs “browse all public collections”) — can stay as today (global public list) or be refined later.
- Transfer of ownership (e.g. change the “first” owner) — covered by “add owner then remove self” if at least one other owner.
- Invitation flow (email invite vs just adding email) — out of scope; adding by email is sufficient for this spec.
- Collection-level visibility (e.g. “public collection” vs “private collection”) — not in scope; existing recipe public/private can remain.

## Questions and Clarifications

- None. DELETE collection: forbid if collection has any recipes (only allow when empty). No backfill—scorched earth.
