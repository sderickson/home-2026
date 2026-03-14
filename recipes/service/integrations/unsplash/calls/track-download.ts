import type { ReturnsError } from "@saflib/monorepo";
import { request } from "../client.ts";
import type { UnsplashClientError } from "../client.ts";
import { isMocked } from "../client.ts";
import type { UnsplashTrackDownloadResponse } from "../types.ts";
import { mockTrackDownload } from "./track-download.mocks.ts";

export type TrackDownloadResult = UnsplashTrackDownloadResponse;

/**
 * Track a photo download (required by Unsplash API guidelines).
 * GET /photos/:id/download — call when your app performs a download.
 * When isMocked, returns mock data; otherwise calls the API.
 */
export async function trackDownload(
  photoId: string,
): Promise<ReturnsError<TrackDownloadResult, UnsplashClientError>> {
  if (isMocked) {
    return { result: mockTrackDownload() };
  }

  return request<UnsplashTrackDownloadResponse>(
    `/photos/${encodeURIComponent(photoId)}/download`,
  );
}
