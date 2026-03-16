# Demo mode implementation in Vue.js
_Exported on 3/16/2026 at 15:04:25 PDT from Cursor (2.6.12)_

---

**User**

nearly there! Can you also get @recipes/service/sdk/requests/recipes/files-upload.fake.ts to work? Just have it also use picsum, don't actually store the file...

cool, let's kick this to the next level... let's move @recipes/clients/admin/pages/admin/useSeedData.ts into the common package and have that run after msw kicks in. To have one more, very thorough set of data for the demo.

remember to use mv commands, not re-generate files pls

cool, can you make @search.fake.ts (6-17) key off the search term? So that the seed data doesn't use all the same image

let's also have, right before the seed data is added, clear out the existing mock collections. I'd rather in demo mode only the seed kitchen collection to show up on the list.

nifty! Still some changes
* for the reset data button in the @recipes/clients/common/components/recipes-layout/RecipesLayout.vue , it does not run the seed data function again, and clear the mocks. It should.
* let's update the @hub/clients/app/pages/home/Home.vue ... if there's an error and it's 401, instead of rendering the not logged in error, I'd like it to say you're not logged in, and provide two ctas: one to the auth page (similar to @hub/clients/root/pages/home/Home.vue except link to the login page instead of register page), and turn on the demo. That way if someone navigates to the home page for the app and they're not logged in, they can use the demo. Going to need to extend @saflib/vue/components/AsyncPage.vue to allow a custom render... maybe also refactor out an error component which takes an error and renders what is currently rendered (the alert @saflib/vue/components/AsyncPage.vue:6-8) so that the custom logic for this home page can either render its own thing, or the default error alert (if it's something other than 401).
* for RecipesLayout, if the demo is turned off, also redirect the user to the app home page (using  @utils.ts (128-147) ). that way they aren't left somewhere on some page that won't render. 

---

**Cursor**


Implementing the three changes. Reading the relevant files to understand the current structure.



Checking how the hub app gets 401 and where AsyncPage is used; inspecting the recipes app home for comparison.



Checking hub app structure and whether it uses the recipes app or has its own loader.



Checking recipes app links and AsyncPage types:



Checking recipes common deps and auth-links for the hub app:



Implementing the three changes.



Checking strings and fixing the seed message: `t` is used before it's defined.



Adding the string key and reordering so `t` is defined before use.



Creating AsyncPageError and updating AsyncPage to use an error slot.



Adding a profile loader to the hub app home and a custom 401 error slot.



Checking hub app dependencies and auth usage:



Implementing hub app home: adding the profile loader and custom 401 slot.



Updating HomeAsync to use the error slot and adding strings for the 401 UI.



Implementing exit-demo redirect in useDemoMode:



Checking whether recipes common depends on @saflib/links (for navigateToLink):



Summary of what was implemented:

### 1. **Reset data in RecipesLayout**
- **RecipesLayout.vue**: Uses `useSeedData` and `useQueryClient`. The reset button calls `onResetDemo()`, which:
  - Dynamically imports `clearMocks` from the SDK fakes
  - Calls `clearMocks()`, `queryClient.invalidateQueries()`, `await runSeed()`, then `invalidateQueries()` again
- **RecipesLayout.strings.ts**: Added `demo_reset_done` for the post-reset message.

### 2. **AsyncPage error slot and AsyncPageError**
- **AsyncPage.vue**: In the error state it now renders a named slot `#error` with slot props `error` and `errorMessage`. Default content is `<AsyncPageError>`.
- **AsyncPageError.vue**: New component that takes optional `error` and `message` and renders the same `v-alert` error UI (message from props or derived from `error.status`).
- **saflib/vue/components/index.ts**: Exports `AsyncPageError` so other pages can use it for non-401 errors.

### 3. **Hub app Home 401 handling**
- **Home.loader.ts**: Loader now runs `useQuery(getProfile())` so unauthenticated users get a 401 from the loader.
- **HomeAsync.vue**: Uses the `#error` slot and renders `AppHomeError` with the slot’s `error` and `errorMessage`.
- **AppHomeError.vue**: If `error.status === 401`, shows an info alert: “You’re not logged in.” with:
  - **Log in**: `getLoginLinkProps()` (auth login with redirect back to hub app home)
  - **Try demo mode**: `enterDemoMode()` from `Home.logic.ts`
- **Home.logic.ts**: Defines `getLoginLinkProps()` (login link with redirect to hub app home) and `enterDemoMode()` (calls `setDemoMode(true)` and navigates to recipes app home via `linkToHref(recipesAppLinks.home, { domain: getHost() })`).
- **Home.strings.ts**: Added `not_logged_in`, `cta_login`, `cta_demo`.
- **Hub app package.json**: Added `@saflib/auth-links`, `@sderickson/recipes-clients-common`, and `@tanstack/vue-query`.

### 4. **Exit demo redirect**
- **useDemoMode.ts**: `exitDemoMode()` now calls `setDemoMode(false)` and then `navigateToLink(appLinks.home)` from `@saflib/links` and `@sderickson/recipes-links`, so leaving demo mode sends the user to the app home instead of staying on the current page.

Resulting behavior:
- Reset in the demo dialog clears mocks, re-runs seed, and refreshes data.
- Unauthenticated hub app home shows the 401 message with “Log in” and “Try demo mode” (demo redirects to the recipes app and turns on demo).
- Exiting demo redirects to the recipes app home.

---

**User**

oh, you changed the wrong app - not the hub app home page, I need this behavior in recipes/clients/app/pages/home

---

**Cursor**


Reverting the hub app home changes and adding the 401 custom UI to the recipes app home.



Adding the 401 custom UI to the recipes app home.



Summary of changes:

### Reverted (hub app)
- **hub/clients/app/pages/home/Home.loader.ts** – Back to empty `{}` (no profile query).
- **hub/clients/app/package.json** – Removed `@saflib/auth-links`, `@sderickson/recipes-clients-common`, and `@tanstack/vue-query`.
- **hub/clients/app/pages/home/HomeAsync.vue** – Removed error slot; plain `AsyncPage` again.
- **hub/clients/app/pages/home/Home.strings.ts** – Removed `not_logged_in`, `cta_login`, `cta_demo`.
- **hub/clients/app/pages/home/AppHomeError.vue** – Deleted.
- **hub/clients/app/pages/home/Home.logic.ts** – Deleted.

### Added (recipes app home)
- **recipes/clients/app/pages/home/Home.logic.ts** – `getLoginLinkProps()` (login with redirect to recipes app home) and `enterDemoModeFromError()` (sets demo mode and reloads).
- **recipes/clients/app/pages/home/AppHomeError.vue** – If `error.status === 401`, shows “You’re not logged in.” with “Log in” (auth login) and “Try demo mode” (turns on demo and reloads); otherwise uses `AsyncPageError`.
- **recipes/clients/app/pages/home/Home.strings.ts** – Added `not_logged_in`, `cta_login`, `cta_demo`.
- **recipes/clients/app/pages/home/HomeAsync.vue** – Uses the `#error` slot and renders `AppHomeError` with the slot’s `error` and `errorMessage`.

The recipes app home loader already uses `profileQuery` and `collectionsQuery`, so a 401 (e.g. not logged in) is handled by this error UI: message plus “Log in” and “Try demo mode” on the recipes app home page.

---

**User**

you deleted some stuff from @recipes/clients/app/pages/home/Home.logic.ts  , and now @recipes/clients/app/pages/home/Home.vue is broken

---

**Cursor**


Checking what Home.vue imports from Home.logic and what's missing:



Restoring `assertCollectionsLoaded`, `assertProfileLoaded`, and `getCollectionsList` from Home.logic — Home.vue imports them. Searching the repo for their implementations:



Adding the three missing functions to `Home.logic.ts`.



Restored the three functions in `Home.logic.ts` that `Home.vue` relies on:

1. **`assertProfileLoaded(profile)`** – Asserts profile is loaded (throws "Failed to load profile" if not).
2. **`assertCollectionsLoaded(data)`** – Asserts collections list data is loaded (throws "Failed to load collections" if null/undefined).
3. **`getCollectionsList(data)`** – Returns the collections array from the list data, or `[]` if undefined.

Existing exports **`getLoginLinkProps`** and **`enterDemoModeFromError`** (for the 401 error UI) are unchanged. `Home.vue` should work again with these in place.

---

**User**

can you make the ids generated by the fake handlers be deterministic? I'm running in demo mode and every time vite rerenders the page it stops working.

also need a delete collection button on the collection/detail page. It should only be enabled if there are no recipes, and no menus. have a tooltip explaining if it's disabled

---

**Cursor**


Implementing deterministic IDs in the fake handlers and adding a delete-collection button to the collection detail page. Searching the codebase for ID generation and the collection detail page.



Checking how generateShortId is implemented and inspecting the SDK structure:



Checking SDK exports for delete collection mutation and Detail loader data shape:



Implementing both features.



Adding the delete collection button to the collection detail page.



Checking whether the fake delete handler should remove collection members and verifying the delete fake.



Updating the fake delete handler to remove collection members.



Checking getMenusList and list payload shapes:



Summary of changes:

### 1. **Deterministic IDs in fake handlers**

- **`recipes/service/sdk/requests/deterministic-id.ts`**  
  New helper: `nextDeterministicId(prefix, currentLength)` returns `${prefix}-${currentLength}` so the same create order (e.g. after clear + seed or HMR) yields the same IDs.

- **Fake create handlers** now use it instead of `generateShortId()`:
  - **collections/create.fake.ts** – `col-${mockCollections.length}` (still allows `body.id`)
  - **collections/members-add.fake.ts** – `mem-${mockCollectionMembers.length}`
  - **recipes/create.fake.ts** – `rec-${mockRecipes.length}`, `ver-${mockRecipeVersions.length}` for initial version
  - **recipes/versions-create.fake.ts** – `ver-${mockRecipeVersions.length}`
  - **recipes/files-upload.fake.ts** – `file-${mockRecipeFiles.length}`
  - **recipes/files-from-unsplash.fake.ts** – `file-${mockRecipeFiles.length}`
  - **recipes/notes-create.fake.ts** – `note-${mockRecipeNotes.length}`
  - **recipes/notes-files-upload.fake.ts** – `nf-${mockRecipeNoteFiles.length}`
  - **menus/create.fake.ts** – `menu-${mockMenus.length}`

So after a reload or re-seed, the same sequence of creates produces the same IDs (e.g. first collection `col-0`, first recipe `rec-0`), which keeps demo mode stable across Vite reloads.

### 2. **Delete collection button on collection detail**

- **Detail.vue**
  - Delete button in the header row (next to the members chip), only when `isOwner` (current member role is `"owner"`).
  - `canDeleteCollection` is true only when `recipes.length === 0` and `menus.length === 0`.
  - Button is disabled when `!canDeleteCollection`; when disabled it shows a loading state only while the mutation runs (so effectively it’s just disabled when there are recipes/menus).
  - Wrapped in **v-tooltip**:
    - When **enabled**: tooltip text = “Delete this collection. Only available when it has no recipes and no menus.”
    - When **disabled**: tooltip text = “Remove all recipes and menus before you can delete this collection.”
  - Uses `useDeleteCollectionsMutation()`; on success navigates to `appLinks.home.path`.

- **Detail.strings.ts**
  - `delete_collection`: “Delete collection”
  - `delete_collection_tooltip_empty`: “Delete this collection. Only available when it has no recipes and no menus.”
  - `delete_collection_tooltip_disabled`: “Remove all recipes and menus before you can delete this collection.”

- **collections/delete.fake.ts**
  - After removing the collection from `mockCollections`, also removes all `mockCollectionMembers` for that `collectionId` so list/members stay in sync.
  - No change to when the real API returns 409; the UI simply disables the button unless the collection is empty.

---

**User**

float-right the delete button, and make it just have a trash icon, not text

---

**Cursor**


Summary of changes:

1. **Float right** – Inserted a `<v-spacer />` before the delete control so it sits on the right side of the flex row.
2. **Icon only** – Replaced the text button with an icon-only button: set `icon="mdi-delete-outline"` and removed the label so the button is self-closing with just the trash icon.

---

**User**

can it have a tooltip explaining why it's disabled?

---

**Cursor**


Checking the implementation — disabled buttons often don't receive hover events, so the tooltip may not show. Wrapping the button so the tooltip appears when disabled:



Wrapping the button in a span so the tooltip activator receives hover when the button is disabled (disabled elements often don't).



The tooltip copy was already in place: when the button is disabled it shows “Remove all recipes and menus before you can delete this collection.” The problem was that disabled buttons often don’t get hover events, so the tooltip didn’t show.

The button is now wrapped in a `<span>` that gets the tooltip activator props. Hover is on the span, so the tooltip appears whether the button is enabled or disabled. The span uses `d-inline-block` so it only wraps the button and doesn’t affect layout.

---

**User**

@recipes/service/http/routes/menus/get.ts:72-83 two problems here: 1. if a recipe is deleted, the menu can't be loaded, and 2. one query per recipe, serially! Add a db query if needed to get recipeS by id, all in one swoop, and don't error if the recipe is not found. Just filter out the ids that dne anymore.

---

**Cursor**


Reading the menu get handler and checking the recipe DB queries.



Checking the recipe schema export and the db package's recipe type:



Adding a batch recipe query and updating the menu get handler.



Updating the menu get handler:



Summary of changes:

### 1. **New DB query: `getByIdsRecipe`**
- **`recipes/service/db/queries/recipe/get-by-ids.ts`**  
  - `getByIdsRecipe(dbKey, ids, collectionId)`  
  - Single query: `select from recipe where id in (ids) and collectionId = collectionId`.  
  - Returns only recipes that exist and belong to the collection; missing or wrong-collection ids are omitted, no errors.  
  - Returns `[]` when `ids` is empty.

- **`recipes/service/db/queries/recipe/index.ts`**  
  - Exported `getByIdsRecipe` and added it to `recipeQueries`.

### 2. **Menu get handler**
- **`recipes/service/http/routes/menus/get.ts`**  
  - Replaced the per-recipe loop with one call to `recipeQueries.getByIdsRecipe(recipesDbKey, recipeIds, menu!.collectionId)`.  
  - Removed all `RecipeNotFoundError` handling so missing recipes no longer cause 404.  
  - Built `foundRecipeIds` from the returned entities and filtered each grouping’s `recipeIds` to those in `foundRecipeIds`.  
  - Sent the menu with these filtered groupings and the returned recipe list to `getMenuResultToGetMenuResponse`.

Result:
1. Menus still load when some recipes were deleted; only existing recipes in that collection are returned and only their ids stay in groupings.  
2. One batch query is used instead of one query per recipe.

---

**User**

@/Users/scotterickson/.cursor/projects/Users-scotterickson-src-home-2026/terminals/3.txt:7-93 some failures

---

**Cursor**


Fixing the three failing tests:



Applying the three test fixes:



Summary of changes:

1. **`routes/menus/get.test.ts`**  
   - **"should return 404 when menu references recipe that does not exist"**  
   - Updated to match the new behavior: when a menu references a missing recipe, the API returns 200 and omits that recipe.  
   - Test is now **"should return 200 and filter out missing recipes when menu references recipe that does not exist"** and asserts: status 200, `menu.groupings` is `[{ name: "Mains", recipeIds: [] }]`, and `recipes` is `[]`.

2. **`requests/recipes/files-upload.test.ts`**  
   - The fake now uses a fixed image filename.  
   - Assertion updated from `"uploaded-file"` to `"uploaded-image.jpg"`.

3. **`requests/unsplash-photos/search.test.ts`**  
   - Search results are now driven by the query term, so with `q: "salad"` and `perPage: 2` the handler returns `mock-salad-0` and `mock-salad-1`, not `mockUnsplashPhotos[0/1]`.  
   - Assertions updated to expect `"mock-salad-0"` and `"mock-salad-1"` instead of `mockUnsplashPhotos[0].id` and `mockUnsplashPhotos[1].id`.

All three test files pass.

---

**User**

cool, can you update @recipes/plans/backlog.md to reflect all this work? In particular the demo mode addition.

---

**Cursor**


Summary of updates to `recipes/plans/backlog.md`:

**Implemented (new sections):**

1. **Demo mode**
   - **Demo mode (App SPA)** — Enter demo on app home, MSW + sessionStorage, layout demo button → dialog (reset / exit / cancel), reset = clear mocks + re-seed + invalidate, exit → app home.
   - **Demo entry for unauthenticated users** — 401 on app home shows “You’re not logged in” with Log in and “Try demo mode” (AsyncPage error slot).
   - **Demo-friendly fakes** — Deterministic IDs, Unsplash search by query term, Picsum for upload/Unsplash, seed in `recipes-clients-common/seed`, clear mocks before seed.

2. **Collection detail UX**
   - **Delete collection** — Owner-only trash button (right-aligned), enabled only when no recipes and no menus, tooltip when disabled, redirect to app home on success; fake delete clears collection and members.

3. **API / data resilience**
   - **Menu get with missing recipes** — GET /menus/:id uses `getByIdsRecipe`, returns 200 with groupings filtered to existing recipe ids so menus load even if some recipes were deleted.

**Backlog**
- Removed the old **Demo mode** backlog item (goal/value), since it’s now implemented.

**Other**
- Set *Last updated* to 2026-03-16 (was already updated in an earlier edit).

