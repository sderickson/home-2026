import type { GetPhotoResult } from "./get-photo.ts";
import type { UnsplashUser } from "../types.ts";

const mockUser: UnsplashUser = {
  id: "mock-user-id",
  updated_at: "2020-01-01T00:00:00Z",
  username: "mockphotographer",
  name: "Mock Photographer",
  first_name: "Mock",
  last_name: "Photographer",
  portfolio_url: null,
  bio: null,
  location: null,
  profile_image: {
    small: "https://example.com/small.jpg",
    medium: "https://example.com/medium.jpg",
    large: "https://example.com/large.jpg",
  },
  links: {
    self: "https://api.unsplash.com/users/mockphotographer",
    html: "https://unsplash.com/@mockphotographer",
    photos: "https://api.unsplash.com/users/mockphotographer/photos",
    portfolio: "https://api.unsplash.com/users/mockphotographer/portfolio",
  },
};

export function mockGetPhoto(): GetPhotoResult {
  return {
    id: "mock-photo-id",
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
    width: 1920,
    height: 1080,
    color: "#000000",
    blur_hash: null,
    description: null,
    alt_description: "Mock photo for testing",
    urls: {
      raw: "https://images.unsplash.com/photo-mock-raw",
      full: "https://images.unsplash.com/photo-mock-full",
      regular: "https://images.unsplash.com/photo-mock-regular",
      small: "https://images.unsplash.com/photo-mock-small",
      thumb: "https://images.unsplash.com/photo-mock-thumb",
    },
    links: {
      self: "https://api.unsplash.com/photos/mock-photo-id",
      html: "https://unsplash.com/photos/mock-photo-id",
      download: "https://unsplash.com/photos/mock-photo-id/download",
      download_location:
        "https://api.unsplash.com/photos/mock-photo-id/download",
    },
    user: mockUser,
    promoted_at: null,
    exif: {
      make: null,
      model: null,
      exposure_time: null,
      aperture: null,
      focal_length: null,
      iso: null,
    },
    location: {
      name: null,
      city: null,
      country: null,
      position: { latitude: null, longitude: null },
    },
  };
}
