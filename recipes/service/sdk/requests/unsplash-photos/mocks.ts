// Shared mock data for unsplash-photos fake handlers.
//
// All fake handlers in this group should use the shared mock array from this
// file so that operations affect one another (e.g. list query returns the same
// data that other operations might mutate).
//
// Export resetMocks() so tests that mutate this array can restore initial state (e.g. in afterEach).
//
// Image URLs use Picsum Photos (https://picsum.photos) — no API key, deterministic per seed.

import type { UnsplashPhotoSearchItem } from "@sderickson/recipes-spec";

/** Build Picsum Photos URLs for fake Unsplash results. Same seed = same image. */
export function picsumPhotoUrls(seed: string): Pick<
  UnsplashPhotoSearchItem,
  "thumbUrl" | "regularUrl"
> {
  return {
    thumbUrl: `https://picsum.photos/seed/${seed}/400/300`,
    regularUrl: `https://picsum.photos/seed/${seed}/800/600`,
  };
}

const PHOTO_SEEDS = ["food-1", "food-2", "food-3", "meal-1", "meal-2", "recipe-1", "recipe-2", "recipe-3", "cook-1", "cook-2"];

export const mockUnsplashPhotos: UnsplashPhotoSearchItem[] = PHOTO_SEEDS.map(
  (seed, i) => ({
    id: `mock-photo-${i + 1}`,
    ...picsumPhotoUrls(seed),
    downloadLocation: `https://api.unsplash.com/photos/mock-photo-${i + 1}/download`,
  }),
);

const initialMockUnsplashPhotos = JSON.parse(
  JSON.stringify(mockUnsplashPhotos),
) as UnsplashPhotoSearchItem[];

/** Restore mock array to its initial state. Call from tests (e.g. afterEach) if they mutate the mocks. */
export function resetMocks(): void {
  mockUnsplashPhotos.length = 0;
  mockUnsplashPhotos.push(...initialMockUnsplashPhotos);
}
