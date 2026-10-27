/** A section of a menu: a name and its recipes in display order. */
export interface MenuGrouping {
  name: string;
  recipeIds: string[];
}

/** Where to put a recipe: a menu and a section (existing or new) within it. */
export interface MenuPlacement {
  menuId: string | null;
  section: string;
}

function sameSection(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Groupings with `recipeId` appended to `section`. A section that doesn't
 * exist yet (compared ignoring case and surrounding space) is added at the
 * end. Adding a recipe that's already in the section changes nothing.
 */
export function addRecipeToGroupings(
  groupings: MenuGrouping[],
  section: string,
  recipeId: string,
): MenuGrouping[] {
  const name = section.trim();
  const index = groupings.findIndex((g) => sameSection(g.name, name));
  if (index === -1) {
    return [...groupings, { name, recipeIds: [recipeId] }];
  }
  return groupings.map((g, i) =>
    i === index && !g.recipeIds.includes(recipeId)
      ? { ...g, recipeIds: [...g.recipeIds, recipeId] }
      : g,
  );
}

/** True when any menu lists the recipe in any section. */
export function isRecipeOnAnyMenu(
  menus: { groupings: MenuGrouping[] }[],
  recipeId: string,
): boolean {
  return menus.some((m) =>
    m.groupings.some((g) => g.recipeIds.includes(recipeId)),
  );
}

/** A placement is complete once it names a menu and a non-blank section. */
export function isPlacementComplete(placement: MenuPlacement): boolean {
  return placement.menuId !== null && placement.section.trim() !== "";
}

/** Default section for a menu: its first section, or blank if it has none. */
export function defaultSectionFor(
  menu: { groupings: MenuGrouping[] } | undefined,
): string {
  return menu?.groupings[0]?.name ?? "";
}
