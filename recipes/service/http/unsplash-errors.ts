import createError from "http-errors";
import {
  UnsplashApiError,
  UnsplashMockUseError,
  UnsplashNetworkError,
  UnsplashNotFoundError,
  UnsplashNotJsonError,
  UnsplashParseError,
  UnsplashRateLimitError,
  UnsplashUnauthorizedError,
} from "@sderickson/recipes-unsplash";
import type { UnsplashClientError } from "@sderickson/recipes-unsplash";

/**
 * Map Unsplash client errors to HTTP errors. Exhaustive on UnsplashClientError
 * so new error classes force a compile-time update here.
 */
export function throwOnUnsplashError(
  err: UnsplashClientError,
  context?: "fetch photo" | "track download" | "search",
): never {
  const msg = err.message ?? (context ? `Unsplash ${context} failed` : "Unsplash request failed");
  switch (true) {
    case err instanceof UnsplashRateLimitError:
      throw createError(429, "Unsplash rate limit exceeded.", {
        code: "UNSPLASH_RATE_LIMIT",
      });
    case err instanceof UnsplashUnauthorizedError:
      throw createError(502, "Unsplash unauthorized.", {
        code: "UNSPLASH_ERROR",
      });
    case err instanceof UnsplashNotFoundError:
      throw createError(502, msg, { code: "UNSPLASH_ERROR" });
    case err instanceof UnsplashApiError:
      throw createError(502, msg, { code: "UNSPLASH_ERROR" });
    case err instanceof UnsplashNetworkError:
      throw createError(502, "Unsplash request failed.", {
        code: "UNSPLASH_ERROR",
      });
    case err instanceof UnsplashMockUseError:
      throw createError(500, "Misconfiguration: Unsplash client used while mocking.", {
        code: "UNSPLASH_ERROR",
      });
    case err instanceof UnsplashNotJsonError:
      throw createError(502, msg, { code: "UNSPLASH_ERROR" });
    case err instanceof UnsplashParseError:
      throw createError(502, msg, { code: "UNSPLASH_ERROR" });
    default:
      throw err satisfies never;
  }
}
