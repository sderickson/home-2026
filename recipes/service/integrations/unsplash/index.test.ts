import { describe, it, expect } from "vitest";
import {
  isMocked,
  request,
  ping,
  search,
  getPhoto,
  trackDownload,
  isUnsplashRateLimitError,
  UnsplashRateLimitError,
} from "@sderickson/recipes-unsplash";

describe("@sderickson/recipes-unsplash", () => {
  it("should export isMocked and request", () => {
    expect(typeof isMocked).toBe("boolean");
    expect(typeof request).toBe("function");
  });

  it("should return result from ping in test (uses mock)", async () => {
    const out = await ping();
    expect(out).toBeDefined();
    expect("error" in out || "result" in out).toBe(true);
    if (out.error) {
      throw out.error;
    }
    expect(out.result).toBeDefined();
    expect(out.result.results).toBeDefined();
    expect(Array.isArray(out.result.results)).toBe(true);
  });

  it("should return result from search in test (uses mock)", async () => {
    const out = await search({ query: "test", per_page: 1 });
    if (out.error) throw out.error;
    expect(out.result.total).toBe(1);
    expect(out.result.results).toHaveLength(1);
  });

  it("should return result from getPhoto in test (uses mock)", async () => {
    const out = await getPhoto("mock-photo-id");
    if (out.error) throw out.error;
    expect(out.result.id).toBe("mock-photo-id");
  });

  it("should return result from trackDownload in test (uses mock)", async () => {
    const out = await trackDownload("mock-photo-id");
    if (out.error) throw out.error;
    expect(out.result.url).toBeDefined();
  });

  it("isUnsplashRateLimitError identifies rate limit error (403 or 429)", () => {
    expect(isUnsplashRateLimitError(new UnsplashRateLimitError("Limited", 403))).toBe(true);
    expect(isUnsplashRateLimitError(new UnsplashRateLimitError("Limited", 429))).toBe(true);
  });

  it("isUnsplashRateLimitError returns false for generic error", () => {
    expect(isUnsplashRateLimitError(new Error("other"))).toBe(false);
  });
});
