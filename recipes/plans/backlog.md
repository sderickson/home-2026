# Recipes site — Backlog & product state

Single source of truth for what’s built, what’s planned, and where the product is headed. Use this to scope the project and drop in new ideas.

---

## Directory (quick navigation)

| Section                         | Description                           |
| ------------------------------- | ------------------------------------- |
| [Implemented](#implemented)     | Features that are built and shipped   |
| [Backlog](#backlog)             | Planned or under consideration        |
| [Related plans](#related-plans) | Links to detailed specs and workflows |

---

## Implemented

Features that exist in the current implementation.

### Core (from recipes-init)

- **Recipes** — Full CRUD: list, get, create, update metadata, delete. Admin-only create/edit/delete; non-admin sees public recipes only.
- **Versioning** — Recipe content lives in versions. “Update latest in place” (e.g. typo fix) vs “Save as new version.” Version history visible to admins (list, optional diff).
- **Notes** — Notes per recipe; optional link to a version. Create, edit, delete; `ever_edited` flag. Admin-only.
- **Recipe files** — Multiple files per recipe: list, upload (Azure), delete, serve blob. Admin manages in app; public recipe detail shows files via download URLs.
- **Note files** — Multiple files per note: same pattern (list, upload, delete, blob serve). Admin-only management in app.
- **Public vs app** — Root client: public recipe list and recipe detail (read-only). App client: full recipe/notes/files/version UX for admins; read-only for non-admins.
- **Access** — Public/private per recipe; admin role; multiple admins can edit any recipe/notes.

### Collections & multi-tenant

- **Collections** — First-class collections: create, list, get, update, delete; collection members with roles (owner, editor, viewer). Enforce validated-email for non-creators; creator cannot be removed or demoted.
- **Recipe scoping** — All recipe endpoints require `collectionId` (query or body); scope and permissions (viewer/editor/owner) enforced. App routes under `/c/:collectionId/...`; breadcrumbs show collection name.
- **Root public recipes** — GET /recipes?publicOnly=true and GET /recipes/:id (no collectionId) for public list and detail on the logged-out site.

### Added without a formal plan

- **Google Doc–style import** — Quick import from a personal Google Doc format into a recipe (title, ingredients, instructions).
- **Ingredient parsing** — Parsing freeform ingredient text into structured `{ name, quantity, unit }` objects for storage/editing.
- **Recipe list cards** — Recipe cards on the list view show non-pantry ingredients (e.g. what you’d need to buy or pull from the pantry).

### Site glue (home & navigation)

- **Logged-in home** — Lists collections the user is in; welcome/orientation block; each collection as a card with name (link to collection detail), optional “other members” when not solo, and menu chips linking to menu detail. Create-collection action; no separate collections list page.
- **Collection detail** — Single page per collection: menus (pills with add), membership pill (opens management dialog), recipes (list + quick import + create). Replaces former menus list and recipes list pages.
- **Navigation** — Home → collection detail → menu detail or recipe detail. Menu-context recipe detail: Home → collection → menu → recipe (shared recipe body, different breadcrumbs). Breadcrumbs and links no longer reference removed list pages.
- **API** — Collections list endpoint returns `menus` in addition to collections and members so the home can show menu chips without extra requests.

### Menus

- **Menus** — Collection-scoped: create, list (by collection), get, update, delete. Data model: `groupings: { name, recipeIds[] }`; each recipe in at most one section per menu.
- **Menu detail (view)** — Two view modes: “fancy” (text-only, column layout, section underlines) and “diner” (cards with images, compact). Subtext from recipe subtitle or comma-separated non-staple ingredients. Links to recipe detail in menu context.
- **Menu-context recipe detail** — Dedicated route and page; reuses `RecipeDetailContent` with menu-specific breadcrumbs (Home → collection → menu → recipe).
- **Menu editing** — Single card: toolbar (clickable menu name → edit-in-dialog, public/private icon with tooltips, save disk icon, cancel), then sections in an accordion. Sections and recipes reorderable via Sortable.js (drag handle). Per-section recipe list + autocomplete to add (unassigned recipes only). Add-section button. See [notes/2026-03-14-ux/cursor_menu_detail_page_improvement.md](./notes/2026-03-14-ux/cursor_menu_detail_page_improvement.md).

### Demo mode

- **Demo mode (App SPA)** — Visitors can try the site without affecting real data. "Enter demo mode" on the app home starts MSW with in-memory fake handlers; sessionStorage persists demo state across reloads. Layout shows a demo indicator (app bar button) that opens a dialog with reset data, exit demo, and cancel. Reset clears mocks, re-runs seed data (Seed Kitchen + sample recipes/menus with Picsum images), and invalidates queries. Exit demo turns off demo and redirects to app home.
- **Demo entry for unauthenticated users** — App home uses AsyncPage with a custom error slot: on 401 (not logged in), shows "You're not logged in" with CTAs to log in (redirect back to app home) or "Try demo mode" (enables demo and reloads). Other errors use the default AsyncPageError.
- **Demo-friendly fakes** — Fake handlers use deterministic IDs (prefix + array length) so IDs are stable across Vite HMR and re-seed. Unsplash search fake keys off the query term for varied Picsum images; upload and add-from-Unsplash fakes use Picsum URLs. Seed data lives in `recipes-clients-common/seed` and runs after MSW activates; existing mocks are cleared before seed so demo shows only Seed Kitchen.

---

## Backlog

Ideas and features under consideration, in rough priority/grouping. Not all will be done; use this to decide scope.

### List / search

- **Scope** — Keep it simple for now: load the full recipe collection on the frontend and filter by query (no server-side search initially).
- **Size** — Small feature; mainly UI + client-side filtering.

### Import / export

- **Goal** — Move recipes from a local/build collection into production (or between environments).
- **Options** — One-time manual port vs. proper import/export (e.g. JSON or bulk format). Optional; could be deferred if one-time port is acceptable.

### Attribution (recipe sources)

- **Goal** — Record where a recipe came from (book, website, etc.).
- **Simple approach** — One string field on the recipe (e.g. `source` or `attribution`). HTTP endpoint that returns all distinct values for autocomplete so we don’t get many variants of the same source.
- **Richer approach** — Dedicated table (e.g. `sources`) so a source can be edited once and shared across recipes; more normalized, better for reporting.

---

## Related plans

| Doc                                                                                                                        | Purpose                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [notes/2026-02-20-recipes-init/recipes-init.plan.md](./notes/2026-02-20-recipes-init/recipes-init.plan.md)                 | Milestone plan and workflows for initial implementation (M1–M4).                                 |
| [notes/2026-02-20-recipes-init/recipes-init.spec.md](./notes/2026-02-20-recipes-init/recipes-init.spec.md)                 | Product & technical spec: user stories, schema, API, packages.                                   |
| [notes/2026-03-12-collections-multi-tenant/](./notes/2026-03-12-collections-multi-tenant/)                                 | Collections & multi-tenant: spec, plan, and workflows (M1–M5).                                   |
| [notes/2026-03-12-unsplash/](./notes/2026-03-12-unsplash/)                                                                 | Unsplash image search and add-as-recipe-file (separate initiative).                              |
| [notes/2026-03-13-menus/](./notes/2026-03-13-menus/)                                                                       | Menus: spec (in progress); plan and workflows to follow.                                         |
| [notes/2026-03-14-ux/cursor_menu_detail_page_improvement.md](./notes/2026-03-14-ux/cursor_menu_detail_page_improvement.md) | Menu detail UX: view modes, edit form (toolbar, accordion, drag-and-drop), home/collection glue. |

---

_Last updated: 2026-03-16_
