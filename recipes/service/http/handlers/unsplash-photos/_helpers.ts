// Mappers from Unsplash API responses to API response types.
import type { UnsplashPhotoSearchItem } from "@sderickson/recipes-spec";

/** Minimal shape of a photo from Unsplash search results (getPhotos). */
export type UnsplashSearchPhoto = {
  id: string;
  urls: { thumb: string; regular: string };
  links: { download_location: string };
};

export function unsplashPhotoToSearchItem(
  photo: UnsplashSearchPhoto,
): UnsplashPhotoSearchItem {
  return {
    id: photo.id,
    thumbUrl: photo.urls.thumb,
    regularUrl: photo.urls.regular,
    downloadLocation: photo.links.download_location,
  };
}