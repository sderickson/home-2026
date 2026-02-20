# Recipe site specification document
_Exported on 2/20/2026 at 12:16:30 PST from Cursor (2.5.17)_

---

**User**

Hey, I'd like to set up a new recipe site for myself. First I'd like your help speccing out the product.

This is a personal website for storing and sharing and updating and tracking changes to recipes. The core feature here really is version control and notes for a recipe... I want to be able to make changes to the recipe, see what changed over time, and write notes to myself as I go of how things went and what I'd like to try. The problem I'm having is I try out recipes weeks or months apart and I don't remember my last experience, so I want a way to look up a recipe, see what I said last about it, and use that for my next attempt, then I might just write a note, or write a note and update the recipe, in which case the note should be associated with the changes, but a note doesn't have to only happen with changes. That's the core personal flow I want...

Then I'd also like to have a way to construct menus. Probably keep it simple, a menu just has a name, and groupings (like a standard menu, drinks, appetizers, sides, mains, etc). A grouping should be customizable, like when I create a menu I should be able to set custom groups and then assign recipes in a certain order to each group. For this, a recipe should have a short description which is displayed on the menu. A longer description can also be associated with a recipe, which shows up when you look at it specifically.

For sharing... I should be able to mark a recipe as public, and people can look through those recipes. There'll be a logged out site @recipes/clients/root/ and a logged in site @recipes/clients/app/ , both I expect will share components between them in the @recipes/service/sdk/ , like listing a recipe or displaying a recipe for making, and they'll hit the same endpoints, but the endpoints will restrict you to public recipes if you're logged out or logged in but not an administrator. You have to be an admin to access private recipes, and to make any changes (read-only otherwise). Menus should also be public/private. Oh and they should keep track of who created them, changed them... menus don't need version history they can just keep track of who has ever edited them.

Recipes should also have file uploads. Just a single file for each recipe. Notes can also have a single file associated with them. In both cases they can be uploaded/replaced in a separate endpoint. And deleted in a separate endpoint. Notes should be editable. A boolean flag for if they've ever been edited.

Anyway! What I'd like you to do now is to take the above and fill out the spec document. We're going to use a workflow to go through this planning process. Please cd into @recipes/plans/ and run the following command and follow the prompts...

npm exec saf-workflow kickoff processes/spec-project recipes-init

---

**Cursor**


Running the workflow kickoff and inspecting the spec template and workflow structure.



Reading the generated spec and the recipes service structure to align the spec with the codebase.



Checking existing spec structure and db schema for patterns:



Filling out the spec from your product description.



Filled out **recipes-init.spec.md** with your product description. Summary of what’s in the spec:

**Overview**
- Personal recipe site with version control and notes as the main value, plus menus and public/private sharing.

**User stories**
- **Recipes:** Versioning, notes (with or without a recipe change), optional link note→version, view “last note,” editable notes + `everEdited`, one file per recipe and per note (separate upload/replace/delete).
- **Menus:** Name + custom groupings, assign recipes in order with short description; recipe has short + optional long description.
- **Sharing:** Public vs private; logged-out and non-admin read-only public; admin for private and all mutations; track created-by / updated-by (menus: “who has ever edited,” no version history).

**Packages**
- `recipes/service/spec`, `db`, `http`, `sdk`; `recipes/clients/root` (logged-out), `recipes/clients/app` (logged-in), with shared SDK components.

**Database**
- Tables: recipes, recipe_versions, recipe_notes, recipe_files, recipe_note_files, menus, menu_groupings, menu_recipe_assignments, with FKs and indexes.

**Business objects**
- Recipe, RecipeVersion, RecipeNote, RecipeFileInfo, RecipeNoteFileInfo, Menu, MenuGrouping, MenuRecipeAssignment.

**API**
- 20 endpoints for recipes (CRUD + versions, notes, recipe file, note file) and menus (CRUD with groupings/assignments), with auth rules (public vs admin) and separate upload/delete for files.

**Frontend**
- Root: public recipe list/detail, public menu list/detail (read-only).
- App: “my recipes” list, recipe detail with version history + notes + file uploads, menu list + create/edit with groupings and assignments; shared components in SDK.

**Out of scope / questions**
- Future enhancements listed; open points: version content shape (markdown vs structured), file storage and limits, exact “who edited” for menus, non-admin access to “my” private recipes.

To move to the next step (workflow will ask you to confirm the spec), run:



The workflow is at the **“Check with the user that the spec is complete and correct”** step.

Please review the full spec at:

**`recipes/plans/notes/2026-02-20-recipes-init/recipes-init.spec.md`**

Check that it matches what you want, especially:

1. **Recipe versioning** — Content is described as “content (e.g. JSON or text)”; confirm whether you want markdown, structured (ingredients + instructions), or something else.
2. **Notes** — Standalone notes vs notes tied to a version, editable notes, and `everEdited` are all in there; say if you want different behavior.
3. **Menus** — Custom groupings per menu and ordered recipe assignments with short descriptions; menus are public/private with “who created / who edited” (no version history).
4. **Files** — One file per recipe and one per note, with separate upload/replace and delete endpoints.
5. **Access** — Logged-out and non-admin: public only, read-only; admin: private access and all mutations. The “Questions” section asks whether non-admins can see “my” private recipes; confirm how you want that.

Once you’re happy with it (or tell me what to change), we can run **`npm exec saf-workflow next`** again to move on to the plan (plan.md and workflows).

---

**User**

Do we need separate rows for files? I was imagining keep it simple and since there's only one file per note/recipe... but I understand that makes it perhaps a bit less flexible in the future. I think either I need to commit to one file per note/recipe, or remove that restriction and just set things up to allow multiple. Eh.... let's just do multiple.

The menu database schemas can be updated, though. I really don't want to share groupings between menus, so the menu object can have nested data in itself. Maybe an array of objects and each object has the name, and an array of recipe ids.

Maybe we should dig into what the content of a recipe is. I'm thinking list of ingredients (well structured, with name of ingredient, quantity, and unit. I don't want these to be super restricted though... unit could be just about anything, and quantity... I kind of want some way to indicate awkward floats like 1/3 or 2+1/3. How might that get stored in a simple and consistent-to-render way? Maybe as strings like I just wrote, e.g. "2+1/3"? Anyway, the rest of the recipe can just be markdown.

I think we should also discuss versioning. It seems recipe versions have all the data, which is fine... but we should think about how to optimize for querying. Like I wonder if we should just try to have one table schema, and have new versions be a transaction where we upload the new version as latest and mark the previous version not as latest, and index things so it's easy to grab just the latest versions. If this versioning system works well I'd probably want to move some of the logic into SAF and reuse it for schemas and database queries.

Speaking of, SAF already has standard properties for file uploads. See @saflib/drizzle/types/file-metadata.ts . So you don't have to specify those columns.

For scope, I do expect multiple users to be admins, and admins can edit each others' stuff no problem. So collaboration is in scope in that way.

For storage, use azure. The workflows with the upload/file flags will do that automatically.

For menus... again, this is fine to just have be a complex json in the database. Be an array of user ids which get appended to when someone new edits it.

>- Whether logged-in non-admin can see their own private recipes or strictly public-only; assumption here is “admin sees private, non-admin sees only public” unless we add “my recipes” for non-admin with same visibility rules.
I don't understand this question. non-admin can't even make recipes, so they don't have private recipes. Maybe to clarify: the logged in experience for non-admins will be basically the same as the logged out experience, at least for now. So the logged-in experience will need to check user permissions and not render some stuff like edit buttons.

---

**Cursor**


Reading SAF's file-metadata type, then updating the spec with your decisions.



Updating the spec with your decisions: multiple files, menu as nested JSON, recipe content shape, single-table versioning with latest flag, SAF file metadata, collaboration/clarity, and storage.



Adding a sentence to the Overview on multi-admin collaboration and Azure storage:



Summary of the spec updates:

**Files**
- **Multiple files** per recipe and per note. Endpoints: list (GET), add (POST), delete by file id (DELETE). No single-file replace.
- **SAF file metadata**: Recipe and note file tables use `fileMetadataColumns` from `@saflib/drizzle/types/file-metadata` (blob_name, file_original_name, mimetype, size, created_at, updated_at); no duplicate column definitions.

**Menus**
- **Single table, nested JSON**: One `menus` table. `groupings` is a JSON array of `{ name: string, recipeIds: string[] }` (order of `recipeIds` = display order). No `menu_groupings` or `menu_recipe_assignments` tables.
- **Short description**: Comes from each recipe’s `short_description` when rendering a menu (not stored per assignment).
- **editedByUserIds**: JSON array of user ids; when a user edits the menu, append their id if not already present.

**Recipe content**
- **Structured**: `ingredients`: array of `{ name, quantity, unit }` (all strings). Quantity supports values like `"1/3"`, `"2+1/3"` for storage and display. Unit is an unrestricted string.
- **instructionsMarkdown**: String (markdown) for the rest of the recipe.

**Versioning**
- **Single table + latest flag**: `recipe_versions` has `is_latest` (boolean). Index on `(recipe_id, is_latest)` so the current version is a simple lookup. New version = insert new row and set the previous row’s `is_latest` to false in one transaction. Note added that this pattern may be generalized in SAF later.

**Scope / access**
- **Collaboration**: Multiple admins can edit each other’s recipes and menus; collaboration in that sense is in scope.
- **Storage**: Azure; workflows with upload/file flags handle it.
- **Logged-in non-admin**: Same experience as logged-out (read-only, public only). No “my private recipes” for non-admins (they can’t create). App uses permissions to hide edit/create UI for non-admins.

**Cleanup**
- Removed the old “single file” and “collaboration out of scope” bullets from Future Enhancements.
- Removed resolved questions; left a short “Questions and Clarifications” with an optional note on documenting max file size / MIME when implementing.

The spec in `recipes/plans/notes/2026-02-20-recipes-init/recipes-init.spec.md` is updated end-to-end with these points.

---

**User**

Why are there still separate recipe and recipe version objects? I'm thinking we collapse it into one table. Like, just have a recipe table and include in it a version id and a recipe id, and different versions share the same recipe id, and version ids are completely unique. Does that make sense?

---

**Cursor**


Using one table: each row is a version with `version_id` (PK) and `recipe_id` (groups versions). We need a minimal identity table so `recipe_notes.recipe_id` and `recipe_files.recipe_id` can reference a unique key. Updating the spec to that model.



Updating the spec to use a single recipe table: `version_id` (PK) and `recipe_id` (groups versions). Adding a minimal `recipe_identities(recipe_id)` table so notes and files can reference a unique recipe id.


---

**User**

why does there need to be a minimal recipe_identities table?

---

**Cursor**


We don't need it if we're okay without a DB-level foreign key.

The only reason to add it was **referential integrity**: in SQL/SQLite a foreign key must reference a unique column (or PK). In a single `recipes` table, `recipe_id` is **not** unique (many rows share the same `recipe_id` for different versions), so we can't define:

- `recipe_notes.recipe_id` → `recipes.recipe_id`
- `recipe_files.recipe_id` → `recipes.recipe_id`

So we have two options:

1. **No `recipe_identities`**  
   One table: `recipes(version_id PK, recipe_id, ...)`. Notes and files store `recipe_id` with **no FK**. The app ensures that any `recipe_id` in notes/files exists as at least one row in `recipes`. Integrity is application-enforced.

2. **With `recipe_identities`**  
   Add a small table where `recipe_id` is unique (e.g. `recipe_identities(recipe_id PK)`), and point notes/files FKs at that. Then the DB enforces “notes/files only reference existing recipes.”

So: **you only need a minimal `recipe_identities` table if you want DB-level FKs from notes/files to “recipe”.** If you’re fine with app-level checks, one table is enough and we can drop `recipe_identities` from the spec.

---

**User**

ah got it. That makes sense. okay then nevermind, what you have now is fine. I think the one thing I'd like to append here... is to have a way to append to the latest version, ie edit it without creating a new version. I can imagine myself making some edits to a recipe and then being like oh whoops there's a typo or what not, and I'd like to have the choice to update the latest version or create a new one.

---

**Cursor**


Adding the "edit latest version in place" option to the spec.



Adding a brief UI note for the recipe edit flow:



Summary of what was added:

**User story**
- You can either **update the latest version in place** (e.g. fix a typo) or **create a new version**, so small fixes don’t clutter history.

**API**
- **PUT /recipes/:id/versions/latest** — Updates the current version’s content in place (no new row, no new history entry). Request body: content (same shape as a version). Response: updated `RecipeVersion` (the latest).
- **POST /recipes/:id/versions** — Still used when you want to **create a new version** (new row, history entry).

**Frontend**
- Recipe detail/edit: when saving content changes, the UI should offer the choice: “Update current version” vs “Save as new version.”

---

**User**

okay this looks good. We're aligned on the spec! Could you continue the workflow?

---

**Cursor**


Listing available workflows and drafting the implementation plan.



Checking the recipes service layout so we can use correct paths in the plan:



Writing the implementation plan:



I’ve filled in **recipes-init.plan.md** with an 8-phase implementation plan:

1. **Phase 1 — Recipes (core):** OpenAPI schemas/routes, Drizzle tables (recipes + recipe_versions), queries, Express handlers. *Stopping point: recipe CRUD + versioning via API.*

2. **Phase 2 — Recipe notes:** Schema, routes, `recipe_notes` table, queries, handlers. *Stopping point: notes API.*

3. **Phase 3 — Recipe files:** `RecipeFileInfo`, file routes (list/upload/delete), `recipe_files` with file metadata + upload flag, handlers + Azure. *Stopping point: recipe file upload works.*

4. **Phase 4 — Recipe note files:** Same pattern for note files. *Stopping point: note file upload works.*

5. **Phase 5 — Menus:** Menu schema (nested JSON), routes, `menus` table, handlers and `editedByUserIds` logic. *Stopping point: menus API.*

6. **Phase 6 — SDK:** add-query / add-mutation (with upload where needed) for all resources; optional shared components. *Stopping point: SDK ready for both clients.*

7. **Phase 7 — Root client:** Public recipe list/detail, menu list/detail (read-only). *Stopping point: logged-out experience.*

8. **Phase 8 — App client:** Recipe list/detail-edit (versions, notes, files, update latest vs new version), menu list/create/edit; admin-only mutation UI. *Stopping point: full app.*

The plan references the workflow IDs and flags (e.g. `upload`, `file`) and notes that dry-runs and `CdStepMachine` should be used so each workflow runs in the right package.

To continue the workflow and get to the “review the plan” step, run:

```bash
cd /Users/scotterickson/src/home-2026/recipes/plans && npm exec saf-workflow next
```

---

**User**

Can you add package name/path to each phase? What packages will be edited/workflow'd exactly.

For components... let's have phase 7, after implementing each page, a prompt saying to refactor logic into the sdk package so the app client can also use them. I think that'll be the most natural time to do it. I think also let's have multiple calls to "add-view", it also works for updating a view. Rather than having the agent one-shot all of the functionality, break it down into more manageable chunks like adding the ability to edit, and then viewing version history, and then adding a note, and then managing recipe files, then managing files for a note... That'd be quite a bit to do all at once!

---

**Cursor**


Updating the plan with package paths, Phase 7 refactor prompts, and Phase 8 broken into smaller add-view steps.



Summary of changes:

**Package paths on every phase**
- **Phase 1–5:** `recipes/service/spec`, `recipes/service/db`, `recipes/service/http` (with a note about monolith if that’s where the app runs).
- **Phase 6:** `recipes/service/sdk`.
- **Phase 7:** `recipes/clients/root`, then `recipes/service/sdk` when refactoring.
- **Phase 8:** `recipes/clients/app`, `recipes/service/sdk`.

**Phase 7 — Refactor after each page**
- After **recipe list:** prompt to refactor listing/display into `recipes/service/sdk` (e.g. recipe list item/card component) for the app client.
- After **recipe detail:** prompt to refactor recipe display (for making/cooking) into the SDK.
- After **menu list:** prompt to refactor menu list display into the SDK if reusable.
- After **menu detail:** prompt to refactor menu detail display into the SDK if reusable.

**Phase 8 — Multiple add-view steps**
- 9 separate view steps instead of one big “recipe detail/edit”:
  1. Recipe list (admin vs non-admin, hide create).
  2. Recipe detail (read-only, reuse SDK).
  3. Recipe edit (metadata + content, update latest vs new version).
  4. Version history on recipe detail.
  5. Notes on recipe (list, add, edit).
  6. Recipe files (list, upload, delete).
  7. Note files (list, upload, delete per note).
  8. Menu list (admin vs non-admin, hide create).
  9. Menu create/edit.

Phase 6 no longer mentions adding shared components there; shared UI is created in the root client in Phase 7 and then moved into the SDK after each page.

---

**User**

cool! onward to the next workflow step...

---

**Cursor**


Checking the workflow file: it contains TODOs and must be updated to implement the plan.



Checking how other workflows use `makeWorkflowMachine` and `CdStepMachine`:



Checking where workflow definitions are exported and their input shapes:



Checking vue workflow id (add-view vs add-page):



Writing the workflow file: adding the necessary dependencies, then the full workflow.



Writing the workflow file with concrete steps and removing TODOs.



Checking vue add-view path format and fixing the workflow if needed:



Fixing the vue path format (no .yaml) and removing the unused import.



Running the workflow again to verify it advances (TODOs resolved):



Summary of what’s done:

**1. Workflow file updated (`recipes-init.workflow.ts`)**

- **TODOs removed** and replaced with concrete steps.
- **Package paths:** All `CdStepMachine` steps use paths relative to `recipes/plans` (e.g. `../service/spec`, `../db`, `../http`, `../service/sdk`, `../clients/root`, `../clients/app`).
- **Phases 1–8** are implemented as steps:
  - **Phase 1:** Spec (Recipe, RecipeVersion schemas + recipe routes) → db (schemas + queries) → http (handlers).
  - **Phase 2:** Recipe notes (spec, db, http).
  - **Phase 3:** Recipe files (spec/db/http with **upload** / **file** where needed).
  - **Phase 4:** Recipe note files.
  - **Phase 5:** Menus (spec, db, http).
  - **Phase 6:** SDK (queries + mutations, including **upload** for file uploads).
  - **Phase 7:** Root client – four `vue/add-view` steps (recipe list, recipe detail, menu list, menu detail), each with a prompt to refactor shared logic into the SDK afterward.
  - **Phase 8:** App client – nine `vue/add-view` steps (recipe list, recipe detail, detail-edit, version-history, notes, recipe-files, note-files, menu list, menu edit).
- **Imports:** From `@saflib/openapi/workflows`, `@saflib/drizzle/workflows`, `@saflib/express/workflows`, `@saflib/sdk/workflows`, and `@saflib/vue/workflows`. If `recipes/plans` doesn’t list these, add them to `package.json` or run the workflow from the monorepo root so they resolve.
- **Vue paths:** All add-view paths use the form `./pages/...` with no `.yaml` (e.g. `./pages/recipes/list`).

**2. Workflow progress**

The spec-project workflow is now at:

**“Have the user review the plan and make sure it’s good to go.”**

So the next step is for you to review `recipes-init.plan.md` (and the new workflow steps in `recipes-init.workflow.ts`). When you’re happy with the plan and the workflow, run:

```bash
cd /Users/scotterickson/src/home-2026/recipes/plans && npm exec saf-workflow next
```

That will move to the final spec-project step (update workflow / dry-run). The workflow file is already updated; you can run `npm exec saf-workflow dry-run ./notes/2026-02-20-recipes-init/recipes-init.workflow.ts` from `recipes/plans` to confirm wiring. If the runner expects the workflow to be run from a different directory, the first `CdStepMachine` path (`../service/spec`) assumes the current working directory is `recipes/plans` when the workflow starts.

---

**User**

Let's actually break this into multiple workflows please. Maybe one per phase, though phase 8 is pretty beefy, that one could be two or three... Use your best judgement - what I'm going for is each workflow will have a different agent and I'd like to hit the sweet spot for continued use of context, vs overloading the agent with too much context.

---

**Cursor**


Splitting the workflow into separate phase workflows and a thin orchestrator. Reading the workflow file to split it accurately.



Creating phase workflow files and turning the main file into an orchestrator. Adding a todo and creating the phase files.



Rewriting the main workflow as an orchestrator and updating the plan.



Summary of what’s in place:

**Orchestrator**
- **recipes-init.workflow.ts** — Only runs the 11 phase workflows in order (no direct steps). Each step can be a different agent.

**Phase workflows (run from `recipes/plans`)**

| Phase | File | What it does | ~Steps |
|-------|------|----------------|--------|
| 1 | **recipes-init-phase-1.workflow.ts** | Recipes core: OpenAPI + Drizzle + Express | 30 |
| 2 | **recipes-init-phase-2.workflow.ts** | Recipe notes: spec, db, http | 14 |
| 3 | **recipes-init-phase-3.workflow.ts** | Recipe files (upload/list/delete) | 12 |
| 4 | **recipes-init-phase-4.workflow.ts** | Recipe note files | 12 |
| 5 | **recipes-init-phase-5.workflow.ts** | Menus | 17 |
| 6a | **recipes-init-phase-6a.workflow.ts** | SDK queries only | 9 |
| 6b | **recipes-init-phase-6b.workflow.ts** | SDK mutations (incl. upload) | 16 |
| 7 | **recipes-init-phase-7.workflow.ts** | Root client: 4 views + refactor into SDK | 4 |
| 8a | **recipes-init-phase-8a.workflow.ts** | App: recipe list, detail, edit | 3 |
| 8b | **recipes-init-phase-8b.workflow.ts** | App: version history, notes, files | 4 |
| 8c | **recipes-init-phase-8c.workflow.ts** | App: menu list, menu edit | 2 |

**Design choices**
- **Phase 6** split into **6a** (queries) and **6b** (mutations) to keep each run under ~20 steps and avoid one huge SDK phase.
- **Phase 8** split into **8a** (list + detail + edit), **8b** (version history + notes + recipe/note files), **8c** (menus) so each agent gets a clear slice of the recipe UI.
- Every phase workflow has **docFiles** (spec + plan) so each agent has the same context.
- **Cd paths** are unchanged: first step in each phase does `../service/spec`, `../db`, `../http`, `../service/sdk`, or `../clients/root` / `../clients/app` from `recipes/plans`.

**Plan**
- **recipes-init.plan.md** has a “Workflows (one per phase)” section with the table above and how to run the orchestrator, a single phase, or a dry-run.

You can run the full stack with the orchestrator or run any phase on its own (e.g. only phase 2 for notes).

---

**User**

I think since each workflow will have its own agent... you should have each one have its first prompt (e.g. @recipes/plans/notes/2026-02-20-recipes-init/recipes-init-phase-2.workflow.ts:46-47 ) include the context.docFiles!.spec and .plan and tell the agent to make sure they understand the plan and their part in it. Start with orientation.

---

**Cursor**


Adding an orientation prefix to the first prompt in each phase workflow.



Adding the orientation prefix to the first prompt in each phase workflow.



Summary of changes:

**Orientation on first prompt (all 11 phase workflows)**

Each phase’s **first step that has a prompt** now starts with:

- **"Orientation: Read context.docFiles.spec and context.docFiles.plan. Make sure you understand the overall plan and your part in it (Phase N: …). Then: "**
- Followed by the existing task text.

So every agent is told to:

1. Read the spec and plan from context.
2. Understand the overall plan and this phase’s role.
3. Then do the first task.

Phase-specific “your part” lines:

- **Phase 1:** recipes core — spec, db, http for recipe CRUD and versioning  
- **Phase 2:** recipe notes — spec, db, http for notes CRUD  
- **Phase 3:** recipe files — list, upload, delete; Azure  
- **Phase 4:** recipe note files — list, upload, delete  
- **Phase 5:** menus — spec, db, http with nested groupings JSON  
- **Phase 6a:** SDK query hooks for recipes, notes, files, menus  
- **Phase 6b:** SDK mutation hooks, including upload  
- **Phase 7:** root client — public pages; refactor into SDK after each  
- **Phase 8a:** app client — recipe list, detail view, edit  
- **Phase 8b:** app client — version history, notes, recipe/note files on detail  
- **Phase 8c:** app client — menu list, menu create/edit

