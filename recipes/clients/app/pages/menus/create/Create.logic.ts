import type { Session } from "@ory/client";

/**
 * Asserts that all data required for the create menu page is loaded.
 */
export function assertCreateDataLoaded(
  session: unknown,
  collectionData: unknown,
  membersData: unknown,
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
  if (recipesData === undefined || recipesData === null) {
    throw new Error("Failed to load recipes");
  }
}

/**
 * Whether the user can create/edit menus in this collection (editor or owner).
 */
export function canEditMenuForRole(role: string | undefined): boolean {
  return role === "owner" || role === "editor";
}

export type CreateMenuFormModel = {
  name: string;
  groupings: { name: string; recipeIds: string[] }[];
};

/**
 * Builds the create menu API payload from form state.
 * Trims name, filters out groupings with empty names, trims grouping names.
 */
export function buildCreateMenuPayload(
  form: CreateMenuFormModel,
  collectionId: string,
): {
  collectionId: string;
  name: string;
  groupings: { name: string; recipeIds: string[] }[];
} {
  return {
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
