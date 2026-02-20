# Recipes Site — Product & Technical Specification

## Overview

Personal recipe site for storing, sharing, updating, and tracking changes to recipes. The main value is **version control and notes**: change a recipe over time, see history, and attach notes (how it went, what to try next) so that attempts weeks or months apart can build on prior experience. Notes can stand alone or be tied to a specific recipe change. A secondary feature is **menus**: named menus with custom groupings (e.g. drinks, appetizers, mains) and ordered recipe ids; each recipe has a short description (shown on menus) and an optional long description (on recipe detail). The site has a **public (logged-out)** experience and an **authenticated (logged-in)** experience; both use shared SDK components and the same API, with access and mutability governed by public/private flags and admin role. Multiple admins can collaborate (edit each other’s recipes and menus). File storage uses **Azure** (workflows with upload/file flags handle this). Logged-in non-admins see the same read-only public experience as logged-out users; the app hides edit/create UI for non-admins.

## User Stories

### Recipe versioning and notes (personal flow)

- As the recipe owner, I want to edit a recipe and have changes versioned so that I can see what changed over time.
- As the recipe owner, I want the choice to either update the latest version in place (e.g. fix a typo) or create a new version, so that small corrections don’t clutter history.
- As the recipe owner, I want to add a note to a recipe (with or without changing the recipe) so that I can record how it went and what to try next.
- As the recipe owner, I want to optionally associate a note with the latest recipe change so that the note is tied to that version.
- As the recipe owner, I want to view a recipe and see my last note(s) so that I can pick up where I left off on my next attempt.
- As the recipe owner, I want to edit existing notes and have a flag indicating whether a note has ever been edited.
- As the recipe owner, I want to attach multiple files to a recipe and multiple files per note (upload and delete via separate endpoints).

### Menus

- As the recipe owner, I want to create a menu with a name and custom groupings (e.g. drinks, appetizers, sides, mains) so that I can plan a meal.
- As the recipe owner, I want to assign recipes to each grouping in a specific order. The recipe’s short description is shown on the menu.
- As the recipe owner, I want recipes to have an optional longer description that appears when viewing the recipe itself (not on the menu).

### Sharing and access

- As a visitor (logged out or logged-in non-admin), I want to browse and view public recipes and public menus in read-only form so that I can use shared content.
- As an admin, I want to mark recipes and menus as public or private and have private content and all mutations (create/update/delete) restricted to admins so that I control what is shared and who can change data.
- As the system, I want to record who created and last changed recipes and menus. For menus, I want an array of user ids that gets appended to when someone new edits the menu (who has ever edited).
- As an admin, I want to edit any recipe or menu (including those created by other admins) so that multiple admins can collaborate.

## Packages to Modify

- **recipes/service/spec**: Add OpenAPI schemas and routes for recipes (with versioning), recipe notes, recipe and note file uploads, and menus.
- **recipes/service/db**: Add Drizzle schema for recipes, recipe versions, recipe notes, recipe/note file tables (multiple files per recipe and per note; use SAF `fileMetadataColumns` from `@saflib/drizzle/types/file-metadata`), and menus (with nested groupings JSON); migrations. File storage: Azure (workflows with upload/file flags handle this).
- **recipes/service/http** (or equivalent): Add handlers and wiring for new routes; enforce public/private and admin-only mutation rules.
- **recipes/service/sdk**: Add shared components and API client usage for listing/displaying recipes (and menus) so that root and app clients can reuse them.
- **recipes/clients/root**: Logged-out site: public recipe list, public recipe detail, public menu list/detail; read-only; same endpoints with restricted access.
- **recipes/clients/app**: Logged-in site: full recipe CRUD, version history, notes (create/edit), file upload/replace/delete; menu CRUD and assignment; read-only for non-admins, full access for admins.

## Database Schema Updates

- **recipes**: id, title, short_description, long_description (nullable), is_public, created_by, created_at, updated_by, updated_at. Versioning is in a separate table; recipes hold metadata only.
- **recipe_versions**: id, recipe_id, content (JSON; see Recipe content structure below), is_latest (boolean), created_by, created_at. Only one row per recipe has is_latest = true. Index on (recipe_id, is_latest) so “get current version” is a simple lookup. New version = insert new row + set previous row’s is_latest to false in the same transaction. Ordered by created_at for history. (This pattern may later be generalized in SAF for reuse.)
- **recipe_notes**: id, recipe_id, recipe_version_id (nullable; links note to a version when written with a change), body, ever_edited (boolean), created_by, created_at, updated_by, updated_at.
- **recipe_files**: id, recipe_id, …fileMetadataColumns from `@saflib/drizzle/types/file-metadata` (blob_name, file_original_name, mimetype, size, created_at, updated_at), plus uploaded_by if desired. Multiple rows per recipe.
- **recipe_note_files**: id, recipe_note_id, …fileMetadataColumns, plus uploaded_by if desired. Multiple rows per note.
- **menus**: id, name, is_public, created_by, created_at, edited_by_user_ids (JSON array of user ids; append when a new user edits the menu), groupings (JSON). No separate tables for groupings. **Groupings shape**: array of `{ name: string, recipeIds: string[] }`; order of recipeIds is display order. Short description on the menu comes from each recipe’s short_description.

**Recipe version content (JSON)**:
- **ingredients**: array of `{ name: string, quantity: string, unit: string }`. Quantity is a string to support values like `"1/3"`, `"2+1/3"` for consistent storage and rendering. Unit is an unrestricted string.
- **instructionsMarkdown**: string (markdown for the rest of the recipe).

Appropriate indexes and foreign keys for listing by owner, by public, and for version/note history.

## Business Objects

1. **Recipe**
   - Description: Core recipe record with visibility and descriptions.
   - Properties: id, title, shortDescription, longDescription (optional), isPublic, createdBy, createdAt, updatedBy, updatedAt; optionally current version summary or latest version id for display.

2. **RecipeVersion**
   - Description: One immutable revision of recipe content.
   - Properties: id, recipeId, content (see Recipe content structure below), isLatest, createdBy, createdAt.
   - **Content shape**: `{ ingredients: { name, quantity, unit }[], instructionsMarkdown: string }`; quantity and unit are strings (quantity e.g. `"2+1/3"`).

3. **RecipeNote**
   - Description: A note attached to a recipe, optionally tied to a version.
   - Properties: id, recipeId, recipeVersionId (optional), body, everEdited, createdBy, createdAt, updatedBy, updatedAt.

4. **RecipeFileInfo**
   - Description: Metadata for one file attached to a recipe. Uses SAF file metadata (blob_name, file_original_name, mimetype, size, created_at, updated_at).
   - Properties: id, recipeId, plus FileMetadataFields from `@saflib/drizzle/types/file-metadata`; optionally uploadedBy; URL or download path as needed for API.

5. **RecipeNoteFileInfo**
   - Description: Metadata for one file attached to a note. Same SAF file metadata pattern.
   - Properties: id, recipeNoteId, plus FileMetadataFields; optionally uploadedBy.

6. **Menu**
   - Description: A named menu with visibility and nested groupings. No separate grouping/assignment tables.
   - Properties: id, name, isPublic, createdBy, createdAt, editedByUserIds (array of user ids, appended when a new user edits), groupings (array of `{ name: string, recipeIds: string[] }`; order of recipeIds is display order). Short description on the menu is the recipe’s short_description.

## API Endpoints

### Recipes

1. **GET /recipes**
   - Purpose: List recipes. Public-only for unauthenticated or non-admin; admins can see private.
   - Request parameters: optional filters (e.g. public-only for non-admin is implicit).
   - Response: Array of Recipe (with optional current version or latest version id).
   - Authorization: Any; scope restricted by role (public vs admin).

2. **GET /recipes/:id**
   - Purpose: Get one recipe with current version and metadata (and optionally latest note or recent notes).
   - Response: Recipe plus current RecipeVersion; optionally list of recent RecipeNote; array of RecipeFileInfo.
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
   - Purpose: Update recipe metadata (title, descriptions, isPublic) only. Content changes use “update latest” or “new version” below.
   - Request body: fields to update.
   - Response: Updated Recipe.
   - Authorization: Admin only.

6. **PUT /recipes/:id/versions/latest**
   - Purpose: Update the latest version in place (e.g. typo, small fix). No new version created; the current version row is updated.
   - Request body: content (full or partial; same shape as version content).
   - Response: Updated RecipeVersion (the latest).
   - Authorization: Admin only.

7. **POST /recipes/:id/versions**
   - Purpose: Create a new recipe version (recorded history entry). Inserts new row, sets is_latest on new row and clears on previous.
   - Request body: content for new version.
   - Response: New RecipeVersion.
   - Authorization: Admin only.

8. **DELETE /recipes/:id**
   - Purpose: Soft or hard delete recipe (and handle versions/notes/files per policy).
   - Authorization: Admin only.

### Recipe notes

9. **GET /recipes/:id/notes**
   - Purpose: List notes for a recipe (e.g. chronological).
   - Response: Array of RecipeNote (with optional file info).
   - Authorization: Same as GET /recipes/:id.

10. **POST /recipes/:id/notes**
   - Purpose: Create a note; optionally link to a recipe version (e.g. current at time of note).
   - Request body: body, recipeVersionId (optional).
   - Response: RecipeNote.
   - Authorization: Admin only.

11. **PUT /recipes/:id/notes/:noteId**
    - Purpose: Edit a note; set everEdited to true when applied.
    - Request body: body (and any other editable fields).
    - Response: Updated RecipeNote.
    - Authorization: Admin only.

12. **DELETE /recipes/:id/notes/:noteId**
    - Purpose: Delete a note (and its files).
    - Authorization: Admin only.

### Recipe files

13. **GET /recipes/:id/files**
    - Purpose: List all files for a recipe.
    - Response: Array of RecipeFileInfo.
    - Authorization: Same as GET /recipes/:id.

14. **POST /recipes/:id/files**
    - Purpose: Upload a new file for a recipe (multiple files allowed).
    - Request: multipart or binary; store in Azure via workflow; associate with recipe.
    - Response: RecipeFileInfo.
    - Authorization: Admin only.

15. **DELETE /recipes/:id/files/:fileId**
    - Purpose: Remove one file from a recipe.
    - Authorization: Admin only.

### Note files

16. **GET /recipes/:id/notes/:noteId/files**
    - Purpose: List all files for a note.
    - Response: Array of RecipeNoteFileInfo.
    - Authorization: Same as GET /recipes/:id/notes.

17. **POST /recipes/:id/notes/:noteId/files**
    - Purpose: Upload a new file for a note (multiple files allowed).
    - Request: multipart or binary; store in Azure.
    - Response: RecipeNoteFileInfo.
    - Authorization: Admin only.

18. **DELETE /recipes/:id/notes/:noteId/files/:fileId**
    - Purpose: Remove one file from a note.
    - Authorization: Admin only.

### Menus

19. **GET /menus**
    - Purpose: List menus (public only for non-admin).
    - Response: Array of Menu (with nested groupings).
    - Authorization: Public for anyone; private only for admin.

20. **GET /menus/:id**
    - Purpose: Get menu with nested groupings (each grouping has name and recipeIds in order). Short descriptions come from each recipe’s short_description when displaying.
    - Response: Menu (groupings embedded); optionally minimal Recipe info for display.
    - Authorization: Same as GET /menus.

21. **POST /menus**
    - Purpose: Create menu with nested structure.
    - Request body: name, isPublic, groupings (array of `{ name, recipeIds }`).
    - Response: Menu.
    - Authorization: Admin only.

22. **PUT /menus/:id**
    - Purpose: Update menu name, isPublic, and groupings. On edit, append current user id to editedByUserIds if not already present.
    - Request body: name, isPublic, groupings.
    - Response: Updated Menu.
    - Authorization: Admin only.

23. **DELETE /menus/:id**
    - Purpose: Delete menu.
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
   - Purpose: Browse public menus and view a menu (groupings, recipe names, short descriptions from each recipe).
   - Key features: List menus; detail with groupings and ordered recipe ids (display short description from recipe); links to public recipe detail.

### Logged-in site (recipes/clients/app)

4. **My recipes (list)**
   - Purpose: List recipes (admin: all; non-admin: public only, read-only).
   - Key features: Filter by public/private for admin; open recipe for view/edit; create recipe (admin).

5. **Recipe detail / edit**
   - Purpose: View recipe, version history, and notes; edit metadata and add versions/notes (admin).
   - Key features: Current version display (structured ingredients + markdown instructions); version history with diff or list; notes list with “last time” emphasis; add/edit note (with optional version link); upload/delete recipe files and note files (multiple per recipe/note); edit recipe metadata and content (admin only). When saving content changes, offer choice: update latest version in place (e.g. typo) or create new version (record in history).

6. **Menus (list and edit)**
   - Purpose: List menus (admin sees all; non-admin sees public, read-only); create/edit menu (admin).
   - Key features: List with public/private; create menu with custom groupings (name + ordered recipe ids); assign recipes to groupings; edit/delete menu (admin). Menu display uses each recipe’s short_description.

Shared components in recipes/service/sdk (or equivalent shared package) used by both root and app: recipe list item/card, recipe display (for making), and any shared menu display components; both clients hit the same endpoints with access determined by auth and admin role. **Logged-in non-admin**: experience is the same as logged-out (read-only, public content only). The app checks permissions and does not render edit/create controls for non-admins.

## Future Enhancements / Out of Scope

- Full diff UI between any two recipe versions (could start with “previous vs current”).
- Menu versioning or “menu templates.”
- Search/filter beyond basic list (e.g. by tag, ingredient).
- Import/export (e.g. PDF, other formats).
- Comments or reactions from non-owner viewers on public recipes.
- Generalizing the recipe versioning pattern (single table + is_latest, transactional update) into SAF for reuse with other versioned resources.

## Questions and Clarifications

- None at this time. Optional: document max file size and allowed MIME types for uploads when implementing (workflows with file flags may define these).
