# Menus — Feature Specification

## Overview

Menus let recipe owners group recipes into restaurant-style menus with custom categories (e.g. veggies, pastas, desserts). Each menu has a name and ordered groupings; each grouping has a name and ordered recipe ids. The short description shown on the menu comes from each recipe’s `short_description`. Use cases include: healthy dinner menu, quick dinner menu, brunch menu, Christmas menu, etc.

This feature was specified in the original recipes-init spec but deferred; the data model (e.g. `groupings: { name, recipeIds[] }`) is already defined there. Menus are **collection-scoped**: each menu belongs to a collection and only includes recipes from that collection. Access is governed by collection permissions (viewer/editor/owner), not a global admin role. Where the request path includes the collection (e.g. under `/c/:collectionId/menus`), collection is inferred; only endpoints that do not infer collection require `collectionId` as input.

## User Stories

- As the recipe owner, I want to create a menu with a name and custom groupings (e.g. drinks, appetizers, sides, mains) so that I can plan a meal.
- As the recipe owner, I want to assign recipes to each grouping in a specific order. The recipe’s short description is shown on the menu.
- As the recipe owner, I want recipes to have an optional longer description that appears when viewing the recipe itself (not on the menu).
- As a visitor (logged out or not in the collection), I want to browse and view public menus in read-only form so that I can use shared content.
- As a collection editor or owner, I want to mark menus as public or private and have mutations restricted to editors and owners so that I control what is shared and who can change data.
- As a collection editor or owner, I want to edit any menu in the collection (including those created by others) so that we can collaborate within the collection.

## Packages to Modify

- **recipes/service/spec**: Add OpenAPI schemas and routes for menus (GET/POST /menus, GET/PUT/DELETE /menus/:id), with collectionId required where applicable.
- **recipes/service/db**: Add Drizzle schema for `menu` table (id, collection_id, name, is_public, groupings JSON, created_by, created_at, edited_by_user_ids JSON, etc.); migrations.
- **recipes/service/http**: Add handlers for menu routes; enforce collection permissions (viewer to read, editor/owner to mutate); validate recipeIds in groupings belong to the same collection. Extend recipe API: allow GET /recipes/:id with optional menuId; if menu is public and contains the recipe, return the recipe even when the recipe itself is private (recipe is effectively public in menu context).
- **recipes/service/sdk**: Add query/mutation hooks for menus (list, get, create, update, delete) with collectionId.
- **recipes/clients/root**: Public menu list and public menu detail (read-only). No notion of collections in the public app; show all public menus and allow viewing a public menu and its recipes.
- **recipes/clients/app**: Menu list and edit under `/c/:collectionId/...` (e.g. menus list, create, edit); assign recipes to groupings; breadcrumbs and entry from collection-scoped app.

## Database Schema Updates

- **menu**: id, collection_id (FK to collection, required), name, is_public, created_by, created_at, updated_by, updated_at, edited_by_user_ids (JSON array of user ids; append when a new user edits the menu), groupings (JSON). No separate tables for groupings.
- **Groupings shape**: array of `{ name: string, recipeIds: string[] }`; order of recipeIds is display order. Short description on the menu comes from each recipe’s short_description (fetched when displaying).
- Indexes: by collection_id for listing menus in a collection; appropriate FKs and constraints. Recipe ids in groupings are not stored as FK in DB; validate at API layer that they belong to the same collection.

## Business Objects

1. **Menu**
   - Description: A named menu in a collection, with visibility and nested groupings.
   - Properties: id, collectionId, name, isPublic, createdBy, createdAt, updatedBy, updatedAt, editedByUserIds (array of user ids), groupings (array of `{ name: string, recipeIds: string[] }`). Short description on the menu is the recipe’s short_description (resolved when displaying).

## API Endpoints

Menu endpoints under a collection path (e.g. `/c/:collectionId/menus`) infer collection from the path; only endpoints that do not infer collection require `collectionId` as input. Enforce at least viewer on collection for read; editor/owner for create/update/delete. Validate that recipeIds in groupings belong to the same collection.

1. **GET /menus** (collection-scoped: e.g. under `/c/:collectionId/menus` or with query collectionId)
   - Purpose: List menus in a collection. Viewers see public menus only; editors/owners see all menus in the collection.
   - Request parameters: collectionId only when not inferred from path (e.g. query if no path param).
   - Response: Array of Menu (with nested groupings).
   - Authorization: At least viewer on collection; response filtered by public/private (viewers get only public menus).

2. **GET /menus/:id**
   - Purpose: Get one menu with nested groupings (name and recipeIds in order) and the full recipe objects needed to render it.
   - Request parameters: collectionId only when not inferred from path. For public menu detail (e.g. root app), no collectionId; allowed when menu is public.
   - Response: Object with `menu`: Menu (groupings embedded) and `recipes`: Recipe[] — a separate array of full Recipe objects for every recipe referenced in the menu’s groupings (id, title, shortDescription, etc.; enough to render the menu, not notes/versions/files). Do not nest recipes inside groupings; keep a flat array in the response.
   - Authorization: At least viewer on collection when in collection context; when no collection (public detail), allow if menu is public. 403 if menu not in collection or private and caller has only viewer access.

3. **POST /menus** (collection-scoped)
   - Purpose: Create menu in a collection with nested structure.
   - Request body: name, isPublic, groupings (array of `{ name, recipeIds }`). collectionId inferred from path when under `/c/:collectionId/menus`.
   - Response: Menu.
   - Authorization: Editor or owner on collection.

4. **PUT /menus/:id** (collection-scoped)
   - Purpose: Update menu name, isPublic, and groupings. On edit, append current user id to editedByUserIds if not already present.
   - Request body: name, isPublic, groupings. collectionId inferred from path when applicable.
   - Response: Updated Menu.
   - Authorization: Editor or owner on collection; menu must belong to collection.

5. **DELETE /menus/:id** (collection-scoped)
   - Purpose: Delete menu.
   - Request: collectionId only when not inferred from path.
   - Authorization: Editor or owner on collection; menu must belong to collection.

**GET /menus** (public, for root app): When called without collection context (e.g. no collectionId, or `publicOnly=true`), return all public menus across collections. Used by the root app; no notion of collections in the response or UX.

**Recipe API (extend existing):** Allow GET /recipes/:id with an optional `menuId` (query or context). If `menuId` is provided and the menu is public and contains that recipe, return the recipe even when the recipe itself is private — i.e. if a menu is public, recipes on that menu are effectively public in that context.

Error responses: 400 validation (e.g. recipeIds not in collection), 401 unauthenticated, 403 forbidden, 404 not found. Use existing Error schema where applicable.

## Frontend Pages

### Logged-out site (recipes/clients/root)

1. **Public menu list and detail**
   - Purpose: Browse public menus and view a menu (groupings, recipe names, short descriptions from each recipe). No notion of collections in the public app.
   - Key features: List of all public menus (e.g. GET /menus with publicOnly or equivalent); public menu detail with groupings and ordered recipe ids; display short description from recipe; links to public recipe detail. Recipe detail for a recipe on a public menu is allowed via menuId even when the recipe is otherwise private (recipe effectively public in menu context).

### Logged-in site (recipes/clients/app)

2. **Menus (list and edit)**
   - Purpose: List menus in the current collection; create/edit menu (editor/owner).
   - Key features: Under `/c/:collectionId/menus` (list) and `/c/:collectionId/menus/:id` (edit) or create. List with public/private; create menu with custom groupings (name + ordered recipe ids); assign recipes to groupings (recipes from same collection); edit/delete menu. Menu display uses each recipe’s short_description. Entry from collection-scoped app (e.g. nav or collection home). Access by collection role (viewer/editor/owner), not admin.

Shared components in recipes/service/sdk for menu list item and menu display; root app uses public menu endpoints (no collection); app uses collection-scoped endpoints with collection in path.

## Future Enhancements / Out of Scope

- Menu versioning or “menu templates.”
- Full diff UI between menu versions (if we add versioning later).

## Questions and Clarifications

- Optional: document max length for menu name and grouping names when implementing.
