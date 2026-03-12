import { createApi } from "unsplash-js";
import { typedEnv } from "./env.ts";

const apiKey = typedEnv.UNSPLASH_API_KEY;
console.log("apiKey", apiKey);
const isTest = typedEnv.NODE_ENV === "test";
export const isMocked = !apiKey || apiKey === "mock" || isTest;
if (!apiKey && !isTest) {
  throw new Error(
    "UNSPLASH_API_KEY is required. Set it in your environment or .env file.",
  );
}

/** Success branch of the SDK's ApiResponse; used for mock responses. */
function mockSuccess<T>(response: T) {
  return {
    type: "success" as const,
    response,
    originalResponse: new Response(),
    status: 200,
  };
}

type UnsplashApi = ReturnType<typeof createApi>;
export type ScopedUnsplashClient = {
  search: Pick<UnsplashApi["search"], "getPhotos">;
  photos: Pick<UnsplashApi["photos"], "get" | "trackDownload">;
};

const mockPhotoId = "mock-photo-id";
const mockPhotoBase = {
  id: mockPhotoId,
  created_at: "2020-01-01T00:00:00Z",
  updated_at: "2020-01-01T00:00:00Z",
  urls: {
    full: "https://images.unsplash.com/photo-mock-full",
    raw: "https://images.unsplash.com/photo-mock-raw",
    regular: "https://images.unsplash.com/photo-mock-regular",
    small: "https://images.unsplash.com/photo-mock-small",
    thumb: "https://images.unsplash.com/photo-mock-thumb",
  },
  alt_description: "Mock photo for testing",
  blur_hash: null,
  color: "#000000",
  description: null,
  height: 1080,
  likes: 0,
  links: {
    self: "https://api.unsplash.com/photos/mock-photo-id",
    html: "https://unsplash.com/photos/mock-photo-id",
    download: "https://unsplash.com/photos/mock-photo-id/download",
    download_location: "https://api.unsplash.com/photos/mock-photo-id/download",
  },
  promoted_at: null,
  width: 1920,
  user: {
    id: "mock-user-id",
    username: "mockphotographer",
    name: "Mock Photographer",
    first_name: "Mock",
    last_name: "Photographer",
    bio: null,
    location: null,
    portfolio_url: null,
    profile_image: {
      small: "https://example.com/small.jpg",
      medium: "https://example.com/medium.jpg",
      large: "https://example.com/large.jpg",
    },
    instagram_username: null,
    total_collections: 0,
    total_likes: 0,
    total_photos: 0,
    twitter_username: null,
    updated_at: "2020-01-01T00:00:00Z",
    links: {
      self: "https://api.unsplash.com/users/mockphotographer",
      html: "https://unsplash.com/@mockphotographer",
      photos: "https://api.unsplash.com/users/mockphotographer/photos",
      likes: "https://api.unsplash.com/users/mockphotographer/likes",
      portfolio: "https://api.unsplash.com/users/mockphotographer/portfolio",
      following: "https://api.unsplash.com/users/mockphotographer/following",
      followers: "https://api.unsplash.com/users/mockphotographer/followers",
    },
  },
};

const mockUnsplashClient: ScopedUnsplashClient = {
  search: {
    getPhotos: async () =>
      mockSuccess({
        results: [mockPhotoBase],
        total: 1,
        total_pages: 1,
      }),
  },
  photos: {
    get: async () =>
      mockSuccess({
        ...mockPhotoBase,
        exif: {
          make: null,
          model: null,
          exposure_time: null,
          aperture: null,
          focal_length: null,
          iso: null,
        },
        location: {
          city: null,
          country: null,
          name: null,
          position: { latitude: null, longitude: null },
        },
        related_collections: {
          type: "related",
          results: [],
          total: 0,
        },
      }),
    trackDownload: async () =>
      mockSuccess({ url: "https://images.unsplash.com/photo-mock-download" }),
  },
};

let unsplashClient: ScopedUnsplashClient;

if (isMocked) {
  unsplashClient = mockUnsplashClient;
} else {
  const sdk = createApi({ accessKey: apiKey! });
  unsplashClient = sdk as ScopedUnsplashClient;
}

export const unsplash = unsplashClient;
