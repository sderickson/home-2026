/**
 * Asserts that collection and menus list data are loaded.
 * The Async component only renders when loader queries are ready;
 * this is a guard for type narrowing and consistency.
 */
export function assertMenusListLoaded(
  collectionData: unknown,
  menusData: unknown,
): void {
  if (!collectionData || typeof collectionData !== "object") {
    throw new Error("Failed to load collection");
  }
  const coll = collectionData as { collection?: unknown };
  if (!coll.collection) {
    throw new Error("Failed to load collection");
  }
  if (menusData === undefined || menusData === null) {
    throw new Error("Failed to load menus");
  }
}

/**
 * Normalizes menus query response to a menu array (empty when undefined).
 */
export function getMenusList(
  data: { menus?: unknown[] } | undefined,
): unknown[] {
  return data?.menus ?? [];
}
