// Shared mock data for unsplash-photos fake handlers.
//
// All fake handlers in this group should use the shared mock array from this
// file so that operations affect one another (e.g. list query returns the same
// data that other operations might mutate).
//
// Export resetMocks() so tests that mutate this array can restore initial state (e.g. in afterEach).

import type { UnsplashPhotoSearchItem } from "@sderickson/recipes-spec";

export const mockUnsplashPhotos: UnsplashPhotoSearchItem[] = [
  {
    id: "mock-photo-1",
    thumbUrl: "https://images.unsplash.com/photo-1/thumb",
    regularUrl: "https://images.unsplash.com/photo-1/regular",
    downloadLocation: "https://api.unsplash.com/photos/mock-photo-1/download",
  },
  {
    id: "mock-photo-2",
    thumbUrl: "https://images.unsplash.com/photo-2/thumb",
    regularUrl: "https://images.unsplash.com/photo-2/regular",
    downloadLocation: "https://api.unsplash.com/photos/mock-photo-2/download",
  },
  {
    id: "mock-photo-3",
    thumbUrl: "https://images.unsplash.com/photo-3/thumb",
    regularUrl: "https://images.unsplash.com/photo-3/regular",
    downloadLocation: "https://api.unsplash.com/photos/mock-photo-3/download",
  },
];

const initialMockUnsplashPhotos = JSON.parse(
  JSON.stringify(mockUnsplashPhotos),
) as UnsplashPhotoSearchItem[];

/** Restore mock array to its initial state. Call from tests (e.g. afterEach) if they mutate the mocks. */
export function resetMocks(): void {
  mockUnsplashPhotos.length = 0;
  mockUnsplashPhotos.push(...initialMockUnsplashPhotos);
}
