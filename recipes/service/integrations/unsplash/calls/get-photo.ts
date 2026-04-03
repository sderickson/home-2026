import type { ReturnsError } from "@saflib/monorepo";
import { request } from "../client.ts";
import type { UnsplashClientError } from "../client.ts";
import { isMocked } from "../client.ts";
import type { UnsplashPhotoDetail } from "../types.ts";
import { mockGetPhoto } from "./get-photo.mocks.ts";

export type GetPhotoResult = UnsplashPhotoDetail;

/**
 * Get a single photo by ID (full detail).
 * When isMocked, returns mock data; otherwise calls the API.
 */
export async function getPhoto(
  photoId: string,
): Promise<ReturnsError<GetPhotoResult, UnsplashClientError>> {
  if (isMocked()) {
    return { result: mockGetPhoto() };
  }

  return request<UnsplashPhotoDetail>(`/photos/${encodeURIComponent(photoId)}`);
}
