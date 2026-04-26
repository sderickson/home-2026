import type { Session } from "@ory/client";

/**
 * Asserts that recipe detail data is loaded. Used by both standalone recipe detail
 * and menu-context recipe detail pages.
 */
export function assertRecipeLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipe");
  }
}

export function assertProfileLoaded(session: unknown): asserts session is Session {
  if (!session || !(session as Session).identity) {
    throw new Error("Failed to load session");
  }
}

export function assertVersionsLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load versions");
  }
}

export function assertFilesLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load recipe files");
  }
}
