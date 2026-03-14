/**
 * Unsplash API types. See https://unsplash.com/documentation
 * (No official TypeScript SDK is maintained.)
 */

export const UNSPLASH_API_BASE = "https://api.unsplash.com" as const;

/** Link relations for photos */
export interface UnsplashPhotoLinks {
  self: string;
  html: string;
  download: string;
  download_location: string;
}

export interface UnsplashPhotoUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
}

export interface UnsplashUserProfileImage {
  small: string;
  medium: string;
  large: string;
}

export interface UnsplashUserLinks {
  self: string;
  html: string;
  photos: string;
  portfolio: string;
}

export interface UnsplashUser {
  id: string;
  updated_at: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string | null;
  portfolio_url: string | null;
  bio: string | null;
  location: string | null;
  profile_image: UnsplashUserProfileImage;
  links: UnsplashUserLinks;
  instagram_username?: string | null;
  twitter_username?: string | null;
  total_collections?: number;
  total_likes?: number;
  total_photos?: number;
}

/** Abbreviated photo (list/search) */
export interface UnsplashPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string | null;
  blur_hash: string | null;
  description: string | null;
  alt_description: string | null;
  urls: UnsplashPhotoUrls;
  links: UnsplashPhotoLinks;
  user: UnsplashUser;
  promoted_at: string | null;
}

/** Search photos response */
export interface UnsplashSearchPhotosResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/** Get single photo (full detail) – extends list shape with optional exif, location, etc. */
export interface UnsplashPhotoDetail extends UnsplashPhoto {
  downloads?: number;
  exif?: {
    make: string | null;
    model: string | null;
    exposure_time: string | null;
    aperture: string | null;
    focal_length: string | null;
    iso: number | null;
  } | null;
  location?: {
    name: string | null;
    city: string | null;
    country: string | null;
    position: { latitude: number | null; longitude: number | null };
  } | null;
  tags?: { title: string }[];
}

/** Track a photo download – GET /photos/:id/download response */
export interface UnsplashTrackDownloadResponse {
  url: string;
}
