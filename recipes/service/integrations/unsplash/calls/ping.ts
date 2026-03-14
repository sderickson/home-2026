import { search } from "./search.ts";

/**
 * Performs a read-only search for photos to verify the Unsplash integration.
 * Uses a minimal query and single result.
 */
export async function ping() {
  return search({ query: "nature", per_page: 1 });
}
