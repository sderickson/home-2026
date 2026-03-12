import { unsplash } from "../client.ts";

/**
 * Performs a read-only search for photos to verify the Unsplash integration.
 * Uses a minimal query and single result.
 */
export async function ping() {
  return unsplash.search.getPhotos({
    query: "nature",
    perPage: 1,
  });
}
