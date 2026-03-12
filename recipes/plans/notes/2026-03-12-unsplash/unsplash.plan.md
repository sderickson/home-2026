# Unsplash Images for Recipes — Implementation Plan

This plan implements the [Unsplash spec](./unsplash.spec.md): backend (schema, API, SDK) then frontend (picker, menu, attribution). Run workflows from **recipes/plans**; paths in workflow steps are relative to that. The Unsplash client is in `recipes/service/integrations/unsplash/` (with mocks for tests).

Available workflows (see `npm exec saf-workflow list -- -a -d`): **openapi/add-schema**, **openapi/add-route**, **drizzle/update-schema**, **express/add-handler**, **sdk/add-query**, **sdk/add-mutation**, **vue/add-view**. API design: one URL per action; batch when fetching children for multiple parents; JSON keyed by resource name (see `/saflib/openapi/docs/02-api-design.md`).

---

## Phase 1: Backend — Schema, routes, DB, handlers, SDK

**Workflows to run (in order):**

| Step | Workflow | Args / Notes |
|------|----------|---------------|
| 1 | **openapi/add-schema** | `name: "unsplash-photo-search-item"` — schema for search result item (id, thumbUrl, regularUrl, downloadLocation). |
| 2 | **openapi/add-schema** | `name: "add-recipe-file-from-unsplash-request"` — request body (unsplashPhotoId, downloadLocation, imageUrl). |
| 3 | **openapi/add-schema** | `name: "unsplash-attribution"` — attribution for display (photographerName, photographerProfileUrl, unsplashSourceUrl). |
| 4 | Extend **RecipeFileInfo** | Edit `recipe-file-info.yaml`: add optional `unsplashAttribution` ($ref UnsplashAttribution). No workflow; manual spec edit. |
| 5 | **openapi/add-route** | `path: ./routes/unsplash-photos/search.yaml`, `urlPath: /unsplash-photos/search`, `method: get`. Response: `{ unsplashPhotos: UnsplashPhotoSearchItem[] }`. |
| 6 | **openapi/add-route** | `path: ./routes/recipes/files-from-unsplash.yaml`, `urlPath: /recipes/{id}/files/from-unsplash`, `method: post`. Request body: AddRecipeFileFromUnsplashRequest; response: RecipeFileInfo. |
| 7 | **drizzle/update-schema** | `path: ./schemas/recipe-file.ts` — add column **unsplash_user** (JSON, nullable). Full Unsplash user object when file is from Unsplash. |
| 8 | **express/add-handler** | Handler for GET /unsplash-photos/search. Cd to `../service/http`. Uses `unsplash.search.getPhotos`, maps to UnsplashPhotoSearchItem[]. Register route at `/unsplash-photos/search` (router may live under recipes or top-level). |
| 9 | **express/add-handler** | Handler for POST /recipes/:id/files/from-unsplash. Gets photo via `photos.get`, trackDownload, fetch image, insert recipe_file with unsplash_user, upload to Azure; return RecipeFileInfo with unsplashAttribution. Update **recipeFileToApiRecipeFile** in _helpers to include unsplashAttribution when unsplash_user present (build from stored user + UTM params). |
| 10 | **sdk/add-query** | Query for GET /unsplash-photos/search (urlPath, method: get). |
| 11 | **sdk/add-mutation** | Mutation for POST /recipes/:id/files/from-unsplash (urlPath: /recipes/{id}/files/from-unsplash, method: post). |

**OpenAPI paths:** Add `/unsplash-photos/search` to openapi.yaml (top-level or under recipes as chosen). Ensure **files-list** and file responses use extended RecipeFileInfo so list includes unsplashAttribution.

**Stopping point:** API and SDK support search and add-from-Unsplash; file list and file responses include Unsplash attribution when applicable.

---

## Phase 2: Frontend — Picker, menu, attribution

**Workflows / work:**

| Step | Workflow | Args / Notes |
|------|----------|---------------|
| 1 | **vue/add-view** (or manual) | New view/dialog: Unsplash picker. path e.g. `./pages/recipes/detail/UnsplashPickerDialog.vue` or as component; no route if it’s a dialog. Prompt: takes recipeId, recipeTitle; calls GET /unsplash-photos/search?q=…&perPage=10; shows ~10 thumbnails; user selects one; "Add photo" calls POST from-unsplash; on success close and invalidate files query. |
| 2 | Manual | Recipe detail page: change "add image" button to a **menu** ("Upload from computer" | "Choose from Unsplash"). Unsplash opens picker dialog. |
| 3 | Manual | Full-size image view: when file has **unsplashAttribution**, show "Photo by [name] on Unsplash" with photographer profile link and Unsplash link (UTM params). |

**Stopping point:** User can add a photo from computer or Unsplash; when viewing an Unsplash-sourced image full-size, attribution is displayed per Unsplash API requirements.
