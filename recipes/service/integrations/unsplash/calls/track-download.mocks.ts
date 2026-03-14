import type { TrackDownloadResult } from "./track-download.ts";

export function mockTrackDownload(): TrackDownloadResult {
  return {
    url: "https://images.unsplash.com/photo-mock-download",
  };
}
