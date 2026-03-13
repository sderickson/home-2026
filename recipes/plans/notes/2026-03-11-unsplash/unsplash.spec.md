# Unsplash Images for Recipes — Feature Specification

## Overview

Add the ability to attach a recipe photo by choosing an image from Unsplash, in addition to the existing "upload from computer" flow. When a user adds a photo to a recipe, they can open a modal that automatically searches Unsplash using the recipe title, see a small grid of results (e.g. 10 photos), select one, and confirm. The backend fetches the chosen image, stores it as a recipe file (same as a normal upload), and logs the download with Unsplash as required by their API guidelines.

**Attribution:** Unsplash requires attributing Unsplash, the photographer, and linking back with UTM parameters (`?utm_source=your_app_name&utm_medium=referral`). We store the full Unsplash user object in the DB for each Unsplash-sourced file and expose the minimal attribution fields in the API so the frontend can show credit (e.g. when viewing the image full-size).

The Unsplash client lives in `recipes/service/integrations/unsplash/` and already provides `search.getPhotos`, `photos.get`, and `photos.trackDownload`, with mocks for tests.

## User Stories

- As a recipe editor, I want to add a photo to a recipe by searching Unsplash so that I can use high-quality imagery without leaving the app.
- As a recipe editor, I want the search to default to the recipe title so that I get relevant results with one click.
- As a recipe editor, I want to pick one image from a small set of results and have it added like an uploaded file so that the experience is consistent with existing recipe files.
- As a viewer, I want to see Unsplash and photographer credit when I view a recipe photo full-size (and elsewhere as needed) so that we comply with Unsplash API terms.

## Packages to Modify

- **recipes/service**: DB schema (recipe_file + Unsplash attribution), two API endpoints (Unsplash photo search, add recipe file from Unsplash), using the existing `recipes/service/integrations/unsplash` client.
- **recipes/clients/app**: Update the recipe detail page so the "add photo" control is a menu (upload from computer | choose from Unsplash), add an Unsplash picker dialog, and show attribution when displaying Unsplash-sourced images (at least in full-size view).

## Database Schema Updates

- **recipe_file** table: add one column to store Unsplash attribution.
  - **unsplash_user** (JSON, nullable): when the file was added from Unsplash, store the **full Unsplash user object** returned by the API (e.g. from `photos.get(photoId).response.user`). When the file is from a normal upload, this is null. The DB type and API spec only define the subset of fields we actually use for display; the stored value is the full object for future-proofing and compliance.

## Business Objects

1. **UnsplashPhotoSearchItem** (for search results)
   - Description: One photo returned from Unsplash search, enough to show a thumbnail and to request "add from Unsplash" later.
   - Properties: `id` (string), `thumbUrl` (string, URI), `regularUrl` (string, URI), `downloadLocation` (string, URI — for Unsplash download tracking).

2. **AddRecipeFileFromUnsplashRequest** (request body for add-from-Unsplash)
   - Description: Payload to add a recipe file from an Unsplash photo. Backend will fetch the photo by ID to get the user object for storage.
   - Properties: `unsplashPhotoId` (string), `downloadLocation` (string, URI), `imageUrl` (string, URI — URL to fetch image bytes, e.g. `regular` or `full`).

3. **UnsplashAttribution** (for display; optional on RecipeFileInfo)
   - Description: Minimal fields needed to attribute an Unsplash photo: photographer and links with UTM params per Unsplash API requirements.
   - Properties: `photographerName` (string), `photographerProfileUrl` (string, URI — Unsplash profile URL with `?utm_source=your_app_name&utm_medium=referral`), `unsplashSourceUrl` (string, URI — e.g. `https://unsplash.com?utm_source=your_app_name&utm_medium=referral` for "on Unsplash" link).

4. **RecipeFileInfo** (existing schema) — extend with optional **unsplashAttribution** (UnsplashAttribution | null). When present, the file was sourced from Unsplash and the frontend must show attribution when displaying the image (at least in full-size view; may add elsewhere). Any endpoint that returns recipe file metadata (e.g. `GET /recipes/:id/files` list, upload/from-unsplash response) must include `unsplashAttribution` when the file has `unsplash_user` stored — built from the stored user (name, profile URL with UTM params) and Unsplash source URL with UTM params.

## API Endpoints

Follow conventions in `saflib/openapi/docs/02-api-design.md`: one URL per action, JSON responses keyed by resource name.

1. **GET /unsplash-photos/search**
   - Purpose: Search Unsplash for photos by query (e.g. recipe title). Not recipe-scoped; general Unsplash search. Used by the Unsplash picker modal.
   - Request parameters: `q` (string, required) — search query; `perPage` (integer, optional, default 10) — number of results.
   - Request body: none.
   - Response: Object with key `unsplashPhotos`: array of **UnsplashPhotoSearchItem**.
   - Error responses: 401, 403 (admin or same auth as recipe file upload), 4xx/5xx from Unsplash proxied or mapped as appropriate.
   - Authorization: Same as other recipe write flows (e.g. admin or authenticated as per existing recipe file upload).

2. **POST /recipes/:id/files/from-unsplash**
   - Purpose: Add a recipe file from an Unsplash photo. Backend: (1) fetch photo by ID via `photos.get(unsplashPhotoId)` to get the full user object, (2) call `photos.trackDownload(downloadLocation)`, (3) fetch image at `imageUrl`, (4) insert recipe_file (including `unsplash_user` = full user object), (5) upload bytes to storage (same pipeline as multipart upload). Return **RecipeFileInfo** including **unsplashAttribution** when present.
   - Request parameters: `id` (path) — recipe id.
   - Request body: **AddRecipeFileFromUnsplashRequest** (JSON).
   - Response: Same shape as `POST /recipes/:id/files`: 200 with **RecipeFileInfo** (including optional `unsplashAttribution` for this file).
   - Error responses: 400 (invalid body), 401, 403, 404 (recipe not found), 502/503 if Unsplash or image fetch fails.
   - Authorization: Same as `POST /recipes/:id/files` (admin only).

## Frontend Pages

1. **Recipe detail page** (`recipes/clients/app/pages/recipes/detail/Detail.vue` or components it uses)
   - Purpose: Where users currently add a photo via the toolbar "add image" button (e.g. `mdi-image-plus`). This remains the single entry point for adding a photo.
   - Key features:
     - Replace the single "add image" button with a **menu**: "Upload from computer" and "Choose from Unsplash".
     - "Upload from computer": keep current behavior (file input → upload mutation).
     - "Choose from Unsplash": open the Unsplash picker dialog (see below).
     - When displaying recipe files that have **unsplashAttribution**, show credit when the user views the image full-size (and optionally elsewhere). Credit must include: Unsplash, the photographer name, and links with UTM params (`utm_source=your_app_name&utm_medium=referral`).
   - User interactions: Click add-photo → choose menu item → either pick file and upload, or open Unsplash dialog and complete flow there. When clicking an Unsplash-sourced image to view full-size, attribution is visible.

2. **Unsplash picker dialog** (new component, e.g. used from recipe detail)
   - Purpose: Let the user pick one Unsplash photo for the current recipe.
   - Key features:
     - On open, call `GET /unsplash-photos/search?q={recipeTitle}&perPage=10` (use recipe title as default query; optional: allow editing query later).
     - Display up to 10 small thumbnails (e.g. using `thumbUrl`).
     - User selects one photo (visual selection state).
     - "OK" (or "Add photo") disabled until one is selected. On confirm: call `POST /recipes/:id/files/from-unsplash` with the selected photo’s `id`, `downloadLocation`, and `imageUrl` (e.g. `regularUrl`). On success: close dialog, invalidate/refetch recipe files so the new image appears.
     - "Cancel" closes the dialog without adding.
   - User interactions: Open → see results → select one → OK (add) or Cancel.

## Future Enhancements / Out of Scope

- Editing the search query in the modal (e.g. type a different term than recipe title).
- Paging or "load more" for Unsplash results.
- Using Unsplash for note attachments (only recipe-level files in this spec).
- Caching or preloading Unsplash results.

## Questions and Clarifications

- None at this time. The existing Unsplash client and recipe file upload flow are sufficient to implement the above.
