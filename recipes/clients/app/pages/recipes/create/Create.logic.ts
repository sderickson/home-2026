import type { Session } from "@ory/client";

/**
 * Asserts that create page data is loaded. The Async component only renders the page
 * when loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertCreateDataLoaded(session: unknown): asserts session is Session {
  if (!session || !(session as Session).identity) {
    throw new Error("Failed to load session");
  }
}
