/**
 * Asserts that profile data is loaded.
 */
export function assertProfileLoaded(profile: unknown): asserts profile {
  if (!profile) {
    throw new Error("Failed to load profile");
  }
}

/**
 * Asserts that collections list data is loaded (the collections array).
 */
export function assertCollectionsLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load collections");
  }
}

/**
 * Normalizes collections query data to a list (empty array when undefined).
 */
export function getCollectionsList<T>(data: T[] | undefined): T[] {
  return data ?? [];
}
