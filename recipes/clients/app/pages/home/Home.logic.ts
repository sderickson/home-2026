/**
 * Assertions and list helpers for the home page (collections list data).
 */

export function assertProfileLoaded(profile: unknown): asserts profile {
  if (!profile) {
    throw new Error("Failed to load profile");
  }
}

export function assertCollectionsLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load collections");
  }
}

export function getCollectionsList<T>(data: T[] | undefined): T[] {
  return data ?? [];
}
