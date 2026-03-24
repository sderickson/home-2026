import type { Session } from "@ory/client";

/**
 * Asserts that all data required for the menu detail page is loaded.
 */
export function assertMenuDetailLoaded(
  session: unknown,
  collectionData: unknown,
  membersData: unknown,
  menuData: unknown,
  recipesData: unknown,
): void {
  if (!session || !(session as Session).identity) {
    throw new Error("Failed to load session");
  }
  if (!collectionData || typeof collectionData !== "object") {
    throw new Error("Failed to load collection");
  }
  const coll = collectionData as { collection?: unknown };
  if (!coll.collection) {
    throw new Error("Failed to load collection");
  }
  if (membersData === undefined || membersData === null) {
    throw new Error("Failed to load members");
  }
  if (!menuData || typeof menuData !== "object") {
    throw new Error("Failed to load menu");
  }
  const menuResp = menuData as { menu?: unknown; recipes?: unknown };
  if (!menuResp.menu) {
    throw new Error("Failed to load menu");
  }
  if (recipesData === undefined || recipesData === null) {
    throw new Error("Failed to load recipes");
  }
}

/**
 * Whether the user can edit/delete menus in this collection (editor or owner).
 */
export function canEditMenuForRole(role: string | undefined): boolean {
  return role === "owner" || role === "editor";
}

export type MenuEditFormModel = {
  name: string;
  groupings: { name: string; recipeIds: string[]; _uid?: number }[];
};

/**
 * Builds the update menu API payload from form state.
 * Trims name, filters out groupings with empty names, trims grouping names.
 */
export function buildUpdateMenuPayload(
  form: MenuEditFormModel,
  menuId: string,
  collectionId: string,
): {
  id: string;
  collectionId: string;
  name: string;
  groupings: { name: string; recipeIds: string[] }[];
} {
  return {
    id: menuId,
    collectionId,
    name: form.name.trim(),
    groupings: form.groupings
      .filter((g) => g.name.trim() !== "")
      .map((g) => ({
        name: g.name.trim(),
        recipeIds: g.recipeIds ?? [],
      })),
  };
}

/**
 * Returns the section index (0-based) for a recipe, or -1 if in no section.
 * If a recipe appears in multiple sections (legacy data), returns the first.
 */
export function getSectionIndexForRecipe(
  recipeId: string,
  groupings: { name: string; recipeIds: string[] }[],
): number {
  for (let i = 0; i < groupings.length; i++) {
    if (groupings[i].recipeIds?.includes(recipeId)) return i;
  }
  return -1;
}

/**
 * Assigns a recipe to exactly one section (or none). Mutates groupings:
 * removes recipeId from every section, then adds to the section at sectionIndex if >= 0.
 */
export function setRecipeSection(
  recipeId: string,
  sectionIndex: number,
  groupings: { name: string; recipeIds: string[] }[],
): void {
  for (const g of groupings) {
    const idx = g.recipeIds?.indexOf(recipeId) ?? -1;
    if (idx >= 0) g.recipeIds.splice(idx, 1);
  }
  if (sectionIndex >= 0 && groupings[sectionIndex]) {
    const g = groupings[sectionIndex];
    if (!g.recipeIds) g.recipeIds = [];
    g.recipeIds.push(recipeId);
  }
}
