# Recipes Site — Product & Technical Specification

## Overview

Personal recipe site for storing, sharing, updating, and tracking changes to recipes. The main value is **version control and notes**: change a recipe over time, see history, and attach notes (how it went, what to try next) so that attempts weeks or months apart can build on prior experience. Notes can stand alone or be tied to a specific recipe change. A secondary feature is **menus**: named menus with custom groupings (e.g. drinks, appetizers, mains) and ordered recipe assignments, with short descriptions for menu display and optional long descriptions for recipe detail. The site has a **public (logged-out)** experience and an **authenticated (logged-in)** experience; both use shared SDK components and the same API, with access and mutability governed by public/private flags and admin role.

## User Stories

### Recipe versioning and notes (personal flow)

- As the recipe owner, I want to edit a recipe and have changes versioned so that I can see what changed over time.
- As the recipe owner, I want to add a note to a recipe (with or without changing the recipe) so that I can record how it went and what to try next.
- As the recipe owner, I want to optionally associate a note with the latest recipe change so that the note is tied to that version.
- As the recipe owner, I want to view a recipe and see my last note(s) so that I can pick up where I left off on my next attempt.
- As the recipe owner, I want to edit existing notes and have a flag indicating whether a note has ever been edited.
- As the recipe owner, I want to attach a single file to a recipe (upload/replace/delete via separate endpoints) and a single file per note (same pattern).

### Menus

- As the recipe owner, I want to create a menu with a name and custom groupings (e.g. drinks, appetizers, sides, mains) so that I can plan a meal.
- As the recipe owner, I want to assign recipes to each grouping in a specific order, with a short description shown on the menu.
- As the recipe owner, I want recipes to have an optional longer description that appears when viewing the recipe itself (not on the menu).

### Sharing and access

- As a visitor (logged out or logged-in non-admin), I want to browse and view public recipes and public menus in read-only form so that I can use shared content.
- As an admin, I want to mark recipes and menus as public or private and have private content and all mutations (create/update/delete) restricted to admins so that I control what is shared and who can change data.
- As the system, I want to record who created and last changed recipes and menus (and for menus, who has ever edited them) for accountability and display.

## Packages to Modify

- **recipes/service/spec**: Add OpenAPI schemas and routes for recipes (with versioning), recipe notes, recipe and note file uploads, and menus.
- **recipes/service/db**: Add Drizzle schema for recipes, recipe versions, recipe notes, recipe/note file storage, menus, menu groupings, and menu-recipe assignments; migrations.
- **recipes/service/http** (or equivalent): Add handlers and wiring for new routes; enforce public/private and admin-only mutation rules.
- **recipes/service/sdk**: Add shared components and API client usage for listing/displaying recipes (and menus) so that root and app clients can reuse them.
- **recipes/clients/root**: Logged-out site: public recipe list, public recipe detail, public menu list/detail; read-only; same endpoints with restricted access.
- **recipes/clients/app**: Logged-in site: full recipe CRUD, version history, notes (create/edit), file upload/replace/delete; menu CRUD and assignment; read-only for non-admins, full access for admins.

## Database Schema Updates

- **recipes**: id, title, short_description, long_description (nullable), is_public, created_by, created_at, updated_by, updated_at. (Versioning handled by separate table.)
- **recipe_versions**: id, recipe_id, content (e.g. JSON or text for ingredients/instructions), created_by, created_at. Ordered by created_at for history.
- **recipe_notes**: id, recipe_id, recipe_version_id (nullable; links note to a specific version when note was written with a change), body, ever_edited (boolean), created_by, created_at, updated_by, updated_at.
- **recipe_files**: id, recipe_id, file storage key/path, filename, content_type, uploaded_by, uploaded_at. One row per recipe (enforce single file: replace = update row or delete + insert).
- **recipe_note_files**: id, recipe_note_id, file storage key/path, filename, content_type, uploaded_by, uploaded_at. One row per note.
- **menus**: id, name, is_public, created_by, created_at, updated_by, updated_at. (No version history; only “who created / who last edited” or “who has ever edited” as needed.)
- **menu_groupings**: id, menu_id, name, sort_order. Custom groups per menu.
- **menu_recipe_assignments**: id, menu_id, grouping_id (or equivalent), recipe_id, short_description (for menu display), sort_order. Ordered within each grouping.

Appropriate indexes and foreign keys for listing by owner, by public, and for version/note history.

## Business Objects

1. **Recipe**
   - Description: Core recipe record with visibility and descriptions.
   - Properties: id, title, shortDescription, longDescription (optional), isPublic, createdBy, createdAt, updatedBy, updatedAt; optionally current version summary or latest version id for display.

2. **RecipeVersion**
   - Description: One immutable revision of recipe content.
   - Properties: id, recipeId, content (structured or opaque), createdBy, createdAt.

3. **RecipeNote**
   - Description: A note attached to a recipe, optionally tied to a version.
   - Properties: id, recipeId, recipeVersionId (optional), body, everEdited, createdBy, createdAt, updatedBy, updatedAt.

4. **RecipeFileInfo** (or inline on Recipe)
   - Description: Metadata for the single file attached to a recipe.
   - Properties: id, recipeId, filename, contentType, uploadedBy, uploadedAt (and URL or download path as needed).

5. **RecipeNoteFileInfo**
   - Description: Metadata for the single file attached to a note.
   - Properties: id, recipeNoteId, filename, contentType, uploadedBy, uploadedAt.

6. **Menu**
   - Description: A named menu with visibility.
   - Properties: id, name, isPublic, createdBy, createdAt, updatedBy, updatedAt; optionally groupings and assignments (or fetched separately).

7. **MenuGrouping**
   - Description: A named section within a menu (e.g. “Mains”, “Sides”).
   - Properties: id, menuId, name, sortOrder.

8. **MenuRecipeAssignment**
   - Description: A recipe placed in a menu grouping with order and short description.
   - Properties: id, menuId, groupingId, recipeId, shortDescription, sortOrder.

## API Endpoints

### Recipes

1. **GET /recipes**
   - Purpose: List recipes. Public-only for unauthenticated or non-admin; admins can see private.
   - Request parameters: optional filters (e.g. public-only for non-admin is implicit).
   - Response: Array of Recipe (with optional current version or latest version id).
   - Authorization: Any; scope restricted by role (public vs admin).

2. **GET /recipes/:id**
   - Purpose: Get one recipe with current version and metadata (and optionally latest note or recent notes).
   - Response: Recipe plus current RecipeVersion; optionally list of recent RecipeNote; RecipeFileInfo if present.
   - Authorization: Public recipes for anyone; private only for admin.

3. **GET /recipes/:id/versions**
   - Purpose: List version history for a recipe.
   - Response: Array of RecipeVersion (ordered by createdAt).
   - Authorization: Same as GET /recipes/:id.

4. **POST /recipes**
   - Purpose: Create recipe (and optionally initial version).
   - Request body: title, shortDescription, longDescription (optional), isPublic, initial content for first version.
   - Response: Recipe (and initial RecipeVersion if created).
   - Authorization: Admin only.

5. **PUT /recipes/:id**
   - Purpose: Update recipe metadata (title, descriptions, isPublic). Recipe content changes go through new version.
   - Request body: fields to update.
   - Response: Updated Recipe.
   - Authorization: Admin only.

6. **POST /recipes/:id/versions**
   - Purpose: Create a new recipe version (content change).
   - Request body: content for new version.
   - Response: New RecipeVersion.
   - Authorization: Admin only.

7. **DELETE /recipes/:id**
   - Purpose: Soft or hard delete recipe (and handle versions/notes/files per policy).
   - Authorization: Admin only.

### Recipe notes

8. **GET /recipes/:id/notes**
   - Purpose: List notes for a recipe (e.g. chronological).
   - Response: Array of RecipeNote (with optional file info).
   - Authorization: Same as GET /recipes/:id.

9. **POST /recipes/:id/notes**
   - Purpose: Create a note; optionally link to a recipe version (e.g. current at time of note).
   - Request body: body, recipeVersionId (optional).
   - Response: RecipeNote.
   - Authorization: Admin only.

10. **PUT /recipes/:id/notes/:noteId**
    - Purpose: Edit a note; set everEdited to true when applied.
    - Request body: body (and any other editable fields).
    - Response: Updated RecipeNote.
    - Authorization: Admin only.

11. **DELETE /recipes/:id/notes/:noteId**
    - Purpose: Delete a note (and its file if any).
    - Authorization: Admin only.

### Recipe file

12. **PUT /recipes/:id/file** (or POST for upload, PUT for replace)
    - Purpose: Upload or replace the single file for a recipe.
    - Request: multipart or binary; store and associate with recipe.
    - Response: RecipeFileInfo or 204.
    - Authorization: Admin only.

13. **DELETE /recipes/:id/file**
    - Purpose: Remove the recipe’s file.
    - Authorization: Admin only.

### Note file

14. **PUT /recipes/:id/notes/:noteId/file**
    - Purpose: Upload or replace the single file for a note.
    - Request: multipart or binary.
    - Response: RecipeNoteFileInfo or 204.
    - Authorization: Admin only.

15. **DELETE /recipes/:id/notes/:noteId/file**
    - Purpose: Remove the note’s file.
    - Authorization: Admin only.

### Menus

16. **GET /menus**
    - Purpose: List menus (public only for non-admin).
    - Response: Array of Menu (optionally with groupings and assignments).
    - Authorization: Public for anyone; private only for admin.

17. **GET /menus/:id**
    - Purpose: Get menu with groupings and recipe assignments (with short descriptions and recipe refs).
    - Response: Menu, MenuGrouping[], MenuRecipeAssignment[] (and optionally minimal Recipe info for display).
    - Authorization: Same as GET /menus.

18. **POST /menus**
    - Purpose: Create menu (name, isPublic, initial groupings/assignments optional).
    - Request body: name, isPublic, groupings (name + sortOrder), assignments (groupingId, recipeId, shortDescription, sortOrder).
    - Response: Menu (and groupings/assignments if created).
    - Authorization: Admin only.

19. **PUT /menus/:id**
    - Purpose: Update menu name, isPublic, groupings, and assignments (who-ever-edited tracking).
    - Request body: name, isPublic, groupings, assignments.
    - Response: Updated Menu (and updated groupings/assignments).
    - Authorization: Admin only.

20. **DELETE /menus/:id**
    - Purpose: Delete menu and its groupings/assignments.
    - Authorization: Admin only.

Error responses: 400 validation, 401 unauthenticated, 403 forbidden (e.g. private resource or non-admin mutation), 404 not found. Use existing Error schema where applicable.

## Frontend Pages

### Logged-out site (recipes/clients/root)

1. **Public recipe list**
   - Purpose: Browse public recipes (read-only).
   - Key features: List/card view of public recipes (title, short description); link to recipe detail.
   - Uses shared SDK components for listing and display; calls same API with no auth or non-admin auth.

2. **Public recipe detail**
   - Purpose: View a single public recipe for cooking (current version, instructions, optional long description).
   - Key features: Show current version, ingredients/instructions; optional “last note” or recent notes if we expose that on public view (or restrict to logged-in); file download if present.

3. **Public menu list and detail**
   - Purpose: Browse public menus and view a menu (groupings, recipe names, short descriptions).
   - Key features: List menus; detail with groupings and ordered recipes with short descriptions; links to public recipe detail.

### Logged-in site (recipes/clients/app)

4. **My recipes (list)**
   - Purpose: List recipes (admin: all; non-admin: public only, read-only).
   - Key features: Filter by public/private for admin; open recipe for view/edit; create recipe (admin).

5. **Recipe detail / edit**
   - Purpose: View recipe, version history, and notes; edit metadata and add versions/notes (admin).
   - Key features: Current version display; version history with diff or list; notes list with “last time” emphasis; add/edit note (with optional version link); upload/replace/delete recipe file and note files; edit recipe metadata and create new version (admin only).

6. **Menus (list and edit)**
   - Purpose: List menus (admin sees all; non-admin sees public, read-only); create/edit menu (admin).
   - Key features: List with public/private; create menu with custom groupings; assign recipes to groupings in order with short descriptions; edit/delete menu (admin).

Shared components in recipes/service/sdk (or equivalent shared package) used by both root and app: recipe list item/card, recipe display (for making), and any shared menu display components; both clients hit the same endpoints with access determined by auth and admin role.

## Future Enhancements / Out of Scope

- Full diff UI between any two recipe versions (could start with “previous vs current”).
- Multiple files per recipe or per note.
- Menu versioning or “menu templates.”
- Search/filter beyond basic list (e.g. by tag, ingredient).
- Import/export (e.g. PDF, other formats).
- Collaboration (multiple editors); scope is single-owner with optional public sharing.
- Comments or reactions from non-owner viewers on public recipes.

## Questions and Clarifications

- Recipe version “content” shape: freeform text (markdown) vs structured (ingredients list + instructions)? This affects schema and UI.
- File storage: use existing blob/store service or new bucket; max size and allowed MIME types for recipe and note files.
- “Who has ever edited” for menus: single updated_by/updated_at vs separate audit table; confirm which is in scope.
- Whether logged-in non-admin can see their own private recipes or strictly public-only; assumption here is “admin sees private, non-admin sees only public” unless we add “my recipes” for non-admin with same visibility rules.
