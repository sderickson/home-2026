# Recipes site — Backlog & product state

Single source of truth for what’s built, what’s planned, and where the product is headed. Use this to scope the project and drop in new ideas.

---

## Directory (quick navigation)

| Section | Description |
|--------|-------------|
| [Implemented](#implemented) | Features that are built and shipped |
| [Backlog](#backlog) | Planned or under consideration |
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

### Added without a formal plan

- **Google Doc–style import** — Quick import from a personal Google Doc format into a recipe (title, ingredients, instructions).
- **Ingredient parsing** — Parsing freeform ingredient text into structured `{ name, quantity, unit }` objects for storage/editing.
- **Recipe list cards** — Recipe cards on the list view show non-pantry ingredients (e.g. what you’d need to buy or pull from the pantry).

---

## Backlog

Ideas and features under consideration, in rough priority/grouping. Not all will be done; use this to decide scope.

### Menus

- **Concept** — Group recipes into restaurant-style menus with categories (e.g. veggies, pastas, desserts). Each menu has a name and ordered groupings; each grouping has ordered recipe ids; short description on the menu comes from the recipe.
- **Use cases** — Healthy dinner menu, quick dinner menu, indulge dinner menu, brunch menu, Christmas menu, etc.
- **Note** — Menus (API + frontend) were in the original spec but deferred; the data model (e.g. `groupings: { name, recipeIds[] }`) is already specified in `recipes-init.spec.md`.

### Collections & multi-tenant

- **Concept** — Introduce a “collection” as a first-class thing. Allow granting other users the ability to own, edit, and view a full collection (not just one global admin pool).
- **Tension** — The site might stay “one collection” in practice; this feature mainly pushes on extending the identity service and permission model. Could be deferred or kept small (e.g. single shared collection with invited editors).

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

### Demo mode

- **Goal** — Let visitors try the site without affecting real data. Use existing fake/MSW-style handlers so actions (create recipe, edit, etc.) are in-memory and disappear on navigation or refresh.
- **Value** — Safe way for random users to “play” with the product.

### Site glue (home & navigation)

- **Logged-out home** — Clear entry points: e.g. browse public recipes, start demo mode.
- **Logged-in home** — Entry to real experiences: recently changed recipes (and later menus), quick actions, possibly demo mode toggle.
- **Scope** — Make both homes direct users to the right experience; keep navigation and first screen coherent.

---

## Related plans

| Doc | Purpose |
|-----|--------|
| [notes/2026-02-20-recipes-init/recipes-init.plan.md](./notes/2026-02-20-recipes-init/recipes-init.plan.md) | Milestone plan and workflows for initial implementation (M1–M4). |
| [notes/2026-02-20-recipes-init/recipes-init.spec.md](./notes/2026-02-20-recipes-init/recipes-init.spec.md) | Product & technical spec: user stories, schema, API, packages. |
| [notes/2026-03-12-unsplash/](./notes/2026-03-12-unsplash/) | Unsplash image search and add-as-recipe-file (separate initiative). |

---

*Last updated: 2026-03-12*
