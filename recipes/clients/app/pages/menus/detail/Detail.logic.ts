/**
 * Asserts that all data required for the menu detail page is loaded.
 */
export function assertMenuDetailLoaded(
  profile: unknown,
  collectionData: unknown,
  membersData: unknown,
  menuData: unknown,
  recipesData: unknown,
): void {
  if (!profile) {
    throw new Error("Failed to load profile");
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
  isPublic: boolean;
  groupings: { name: string; recipeIds: string[] }[];
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
  isPublic: boolean;
  groupings: { name: string; recipeIds: string[] }[];
} {
  return {
    id: menuId,
    collectionId,
    name: form.name.trim(),
    isPublic: form.isPublic,
    groupings: form.groupings
      .filter((g) => g.name.trim() !== "")
      .map((g) => ({
        name: g.name.trim(),
        recipeIds: g.recipeIds ?? [],
      })),
  };
}
