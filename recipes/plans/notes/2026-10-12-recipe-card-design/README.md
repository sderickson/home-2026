# Recipe card redesign ("Recipe Box")

A visual redesign of the **collection page** and the **recipe page**, plus an app-wide Vuetify theme. The look is a recipe box: index-card white on a kraft-paper background, a red header line and faint blue ruled lines on cards, a condensed sans-serif for titles, and a typewriter-style mono font for quantities and labels.

This is a **restyle only**. Every control and data field in the mockups already exists in the app today. Where the layout moves something (for example, the recipe toolbar goes into an overflow menu on phones), it is the same action in a new place.

## What's in this folder

| File | What it shows |
| --- | --- |
| `designs/collection-desktop.html` | Collection page at desktop width (around 1280px) |
| `designs/collection-mobile.html` | Collection page on a phone (390px) |
| `designs/recipe-desktop.html` | Recipe page at desktop width |
| `designs/recipe-mobile.html` | Recipe page on a phone |
| `designs/styles.css` | Design tokens (colors, fonts, the 32px rule) and reference CSS for every component in the mockups |

To view them, serve the folder, because a file URL won't load the shared stylesheet in some viewers:

```bash
python3 -m http.server 8765 --directory recipes/plans/notes/2026-10-12-recipe-card-design/designs
```

Then open `http://127.0.0.1:8765/collection-desktop.html` and the other pages. Comments in the HTML mark conditional parts (no photo, no description, editor-only actions).

The HTML files are the source of truth for layout and spacing. They are static references, not code to copy. Build with Vuetify components and express the tokens through the theme.

## Non-goals: do not add

- Checking off ingredients, a step-by-step "cook mode", or highlighting the current step.
- A screen-awake toggle. `useScreenWakeLock()` already runs automatically on the recipe detail page; leave it as is.
- New data fields such as cook time, servings, tags, a "last edited" line, or which menu a recipe belongs to.
- Changes to the **menu detail page** layout. The user is happy with it; it should only pick up the new theme colors and fonts.
- Changes to the edit/create recipe forms beyond what the theme gives them for free.

## 1. Theme (do this first)

File: `recipes/clients/common/vuetify-config.ts` (the `theme` and `defaults` blocks are currently empty or commented out). For a reference shape, see `saflib/base/clients/common/vuetify-config.ts`.

### Colors

| Token (styles.css) | Hex | Vuetify theme color | Use |
| --- | --- | --- | --- |
| `--table` | `#E8E3D9` | `background` | Page background |
| `--card` | `#FFFEFA` | `surface` | Cards, app bar, dialogs |
| `--tab` | `#F4EFE4` | custom `surface-tab` | Menu tabs, search field on white |
| `--ink` | `#22252A` | `on-surface`, `on-background` | Body text |
| `--ink-2` | `#4A4E56` | (text class / CSS var) | Subtitles, notes |
| `--muted` | `#5C6068` | (text class / CSS var) | Breadcrumbs, counts, meta |
| `--outline` | `#C9C1B1` | `outline` | Input and button borders |
| `--primary` | `#2C4A75` | `primary` | Primary button, quantities, links, step numbers |
| `--primary-tint` | `#E3EAF4` | custom `primary-tint` | Selected toggle, hover |
| `--label-red` | `#B4432E` | `error` | Section labels (INGREDIENTS / METHOD / NOTES), delete |
| `--red-line` | `#E2A293` | custom `card-red-line` | Index-card header line |
| `--red-line-soft` | `#EBC5BB` | custom | Vertical line between ingredients and method |
| `--rule-blue` | `#D3DEEC` | custom `card-rule` | Ruled lines |
| `--demo` | `#C2513B` | custom `demo` | DEMO badge background |

Custom colors become `--v-theme-<name>` CSS variables (as `r,g,b`), so component CSS can use `rgb(var(--v-theme-card-rule))`.

All text pairs meet WCAG AA (4.5:1). If you change a color, recheck the contrast.

### Typography

- Body: **IBM Plex Sans** (400, 500, 600).
- Titles (collection name, recipe title, card titles, section headings): **IBM Plex Sans Condensed** (500, 600).
- Mono (quantities, step numbers, section labels, breadcrumbs, counts, DEMO badge): **IBM Plex Mono** (400, 500).

Load the fonts with `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-sans-condensed` and `@fontsource/ibm-plex-mono`, or with a Google Fonts link in the client HTML; pick whichever fits how the clients are built. Then set the font family on `.v-application` and add small utility classes (`.font-title`, `.font-mono`) instead of hard-coding families in components.

### Component defaults

These should roughly match the mockups:

- `VBtn`: `rounded: "sm"` (about 6px), `variant: "flat"` for primary and `"outlined"` for secondary; height 44px is the touch target.
- `VCard`: `rounded: "xs"` (3–4px), `flat`. Card shadows are in `styles.css` (`.index-card`, `.recipe`).
- `VTextField` (search): `variant: "outlined"`, `density: "comfortable"`, `bg-color: surface`.
- `VAppBar`: `flat`, `color: surface`, bottom border `outline-soft` (`#D6CFC1`), height 64.
- `VChip`, if it is still used anywhere: `rounded: "sm"`.

### Ruled lines

Ruled areas use `repeating-linear-gradient` (see `.ruled-26` and `.ruled-32` in `styles.css`). Text in a ruled area must use a `line-height` equal to the rule spacing: **26px** on collection cards and **32px** on the recipe card. Vertical margins inside the area must be multiples of that spacing, or the text drifts off the lines. Headings inside ruled areas are a single 32px line (the mono red labels).

## 2. App bar

File: `recipes/clients/common/components/recipes-layout/RecipesLayout.vue`

- Height 90 → 64. White (`surface`) with a 1px bottom border.
- Brand: the small index-card mark (an outlined rectangle with a red top line; see `.brand__mark`) followed by "Scott's Recipe List" in Plex Sans Condensed 600, 20px.
- Nav: text links (App / Account / Logout); the current section is ink-colored and 600 weight, the others muted.
- DEMO badge: a small, solid `demo`-red rectangle in mono, replacing the large orange button. Keep whatever it does today.
- Phones keep the existing `d-md-none` nav drawer.

## 3. Collection page

File: `recipes/clients/app/pages/collections/detail/Detail.vue`. Recipe grid: `recipes/service/sdk/components/recipe-list/` (`RecipeList`). List view: `recipes/clients/app/components/recipes/RecipeListListView.vue`.

### Desktop (`collection-desktop.html`)

1. Breadcrumb in mono, 13px, muted.
2. Header row: collection name (Condensed 600, 44px), then the members button (outlined, "1 member") and the delete-collection square button (owner only; keep the current disabled and tooltip logic).
3. **Menus as divider tabs**: a mono "MENUS" eyebrow, then a row of tabs with rounded tops sitting on a 2px baseline. Each tab is the same link to the menu page as today. The dashed "+" tab is the existing create-menu link (editors only). The `v-divider`s between sections go away; the tab baseline does that job.
4. Recipes toolbar on one wrapping row: "Recipes (9)" (the count in mono), the search field taking the remaining width, **Import** (existing quick import), **New recipe** (primary), and the existing grid/list toggle as a two-button segmented control.
5. **Index-card grid**: `repeat(auto-fill, minmax(300px, 1fr))`, 22px gap, 5:3 cards.
   - Head: title in Condensed 600, 22px, with a 1.5px red line underneath.
   - Body: blue lines every 26px. Line 1 is the subtitle; line 2 is the key ingredients in mono blue. Use the same subtext and key-ingredient logic that already exists: `RecipeList.logic.ts` and the `keyIngredients` enrichment used on the menu page.
   - Photo: if the recipe has an image, show the first one as a 62px square "print" (3px white border, small shadow) in the top-right corner, and pad the title so it doesn't run under the photo. No image means no thumbnail and no placeholder.
   - Hover: lift 3px with a deeper shadow.
   - This replaces the current masonry layout with its tall blank cards.
6. List view (the toggle): keep it. Style it as the compact rows from the phone mockup (white rows with a red top line).

### Phone (`collection-mobile.html`, below the `md` breakpoint)

- Header block on white: breadcrumb, collection name (32px), a compact members button, and an overflow (⋮) menu holding the **authoring actions**: Import, New recipe, Delete collection. The grid/list toggle is hidden on phones, which always use rows.
- Search field full width, 48px tall, `surface-tab` fill.
- Menu tabs on one row that scrolls horizontally.
- Recipes as compact rows: title (Condensed 19px), subtitle, and a 48px photo print on the right if there is an image. Sort the rows alphabetically by title and group them under mono red letter headings (B, L, R…). This is presentation only. While a search is active, drop the letter headings and show the matches as one flat list.

## 4. Recipe page (the main change)

Files:
- `recipes/clients/app/components/recipe-detail/RecipeDetailContent.vue` (toolbar and dialogs)
- `recipes/service/sdk/components/recipe-content-preview/RecipeContentPreview.vue` (content rendering)
- The page wrappers `recipes/clients/app/pages/recipes/detail/Detail.vue` and `recipes/clients/app/pages/menus/detail/RecipeDetail.vue` (the recipe page reached from a menu), which keep their own breadcrumbs.

**The recipe renders as one card, with everything together in this order: header (title, subtitle, photo) → Ingredients → Method → Notes.** On desktop, Ingredients and Method sit side by side; on phones they stack in that order. Nothing is hidden behind tabs or modes.

### Desktop (`recipe-desktop.html`)

- Breadcrumb above the card (mono). Keep the existing breadcrumb logic, including the different breadcrumbs inside a menu.
- The card holds everything. Toolbar icon buttons sit in its top-right corner: version history (with the version-count badge), edit, add image (the existing upload/Unsplash menu), and delete (red). Same permissions and tooltips as today. The grey `v-toolbar` bar is removed, and the title is no longer repeated.
- Header: title in Condensed 600, 52px, and subtitle at 20px in `ink-2`. Under the header is a 2px red line across the full card width.
- Photo: the first image as a framed print (6px white border, shadow, rotated −1.2°) to the right of the title, about 220×160, `object-fit: cover`. Clicking it opens the existing expanded-image dialog. Additional images go in a row of smaller prints in the same frame style directly under the header. Editors keep the delete (×) button on each image. With no images, the title takes the full width.
- Body (ruled every 32px): **Ingredients** column (basis 380px, with a soft red vertical line on its right) and **Method** column (the rest).
  - Section labels are mono, uppercase, `label-red`, 13px, and one 32px line tall.
  - Ingredient rows are a two-column grid: the quantity and unit in mono blue (72px column), then the name. Use the existing `ingredientLine` pieces, split into quantity+unit and name.
  - Method: render `instructionsMarkdown` as today (`v-html="renderedInstructions"`), styled so that ordered list items get mono blue zero-padded numbers ("01", "02"…) through a CSS counter, a 17px font with 32px line-height, and one blank ruled line between items. Paragraphs and other markdown blocks follow the same 32px rhythm.
- **Notes** (full card width, below both columns, still ruled): the recipe's `description`. It moves from under the subtitle to the end of the card. Leave the section out when the description is empty.
- Rename the "Instructions" heading to **"Method"** and add a **"Notes"** string, both in `RecipeContentPreview.strings.ts`.

### Phone (`recipe-mobile.html`)

- Compact bar: back chevron (to the collection, or to the menu when reached from a menu) with the collection name in mono, and a ⋮ overflow holding the same four toolbar actions.
- One card with 12px margins, everything stacked:
  1. First image, full card width, 200px tall (omit if none). Additional images can go in a horizontal strip below it.
  2. Title (32px) and subtitle, then the red line.
  3. INGREDIENTS (18px text, 32px lines).
  4. METHOD (18px text; mono numbers in a 32px column).
  5. NOTES (description; omit if empty).
- No checkboxes, step highlighting, jump buttons or toggles.

### Other places that use `RecipeContentPreview`

`RecipeForm.vue` (the edit preview), `QuickImportDialog.vue` and `VersionHistoryModal.vue` also render this component, so they pick up the new look. Check that it still fits inside those dialogs. If the full card is too heavy there, add a `compact` prop (no framed photo, no rotation, smaller title) rather than forking the component.

## 5. Accessibility notes

- Icon-only buttons keep `aria-label`s and their existing tooltips. Touch targets are at least 44px.
- Decorative lines are backgrounds, not content. Step numbers come from CSS counters or `aria-hidden` so screen readers hear the native list numbering once.
- Image prints keep their `alt` text (`fileOriginalName`, as today).

## 6. Verifying

- Run the app and log in with demo mode (`http://app.recipes.docker.localhost`, then the DEMO button). The Seed Kitchen collection and its Butternut Squash Soup recipe are the mockups' sample content; the mockups add a few extra recipes and multi-step instructions.
- Compare against the mockups at 1280px and at 390px. Check recipes with and without images and with and without a description.
- Update the existing unit and Playwright tests that reference the old toolbar, headings ("Instructions") or masonry selectors. Keep all copy in the `*.strings.ts` files.
