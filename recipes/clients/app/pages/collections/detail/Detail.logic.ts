import type { Session } from "@ory/client";

/**
 * Assertions and list helpers for collection detail (and re-exports for pages that need them).
 * Inlined from former recipes/list and menus/list logic.
 */

export function assertProfileLoaded(session: unknown): asserts session is Session {
  if (!session || !(session as Session).identity) {
    throw new Error("Failed to load session");
  }
}

export function assertCollectionLoaded(data: unknown): asserts data {
  if (!data) {
    throw new Error("Failed to load collection");
  }
}

export function assertRecipesLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipes");
  }
}

/**
 * Whether the user can create/edit/delete recipes in this collection (owner or editor).
 */
export function canShowCreateRecipeForRole(role: string | undefined): boolean {
  return role === "owner" || role === "editor";
}

export function getRecipesList<T>(data: T[] | undefined): T[] {
  return data ?? [];
}

export function getMenusList(
  data: { menus?: unknown[] } | undefined,
): unknown[] {
  return data?.menus ?? [];
}

/**
 * Asserts that collection detail data (collection, menus, recipes) is loaded.
 */
export function assertCollectionDetailLoaded(
  profile: unknown,
  collectionData: unknown,
  menusData: unknown,
  recipesData: unknown,
): void {
  assertProfileLoaded(profile);
  assertCollectionLoaded(collectionData);
  if (menusData === undefined || menusData === null) {
    throw new Error("Failed to load menus");
  }
  assertRecipesLoaded(recipesData);
}
