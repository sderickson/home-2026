import type { ReturnsError } from "@saflib/monorepo";
import { UNSPLASH_API_BASE } from "./types.ts";
import { typedEnv } from "./env.ts";

const apiKey = typedEnv.UNSPLASH_API_KEY;
const isTest = typedEnv.NODE_ENV === "test";

if (!apiKey && !isTest) {
  throw new Error(
    "UNSPLASH_API_KEY is required. Set it in your environment or .env file.",
  );
}

/** Use mocks when key is "mock" or when running tests. Client must not be used when mocking. */
export const isMocked = !apiKey || apiKey === "mock" || isTest;

// ---------------------------------------------------------------------------
// Error classes — one per kind of error for exhaustive instanceof checks
// ---------------------------------------------------------------------------

/** Client was used while mocking; call layer should use mocks instead. */
export class UnsplashMockUseError extends Error {
  constructor(message = "Unsplash client must not be used when mocking; use call mocks.") {
    super(message);
    this.name = "UnsplashMockUseError";
  }
}

/** Network or fetch failed (e.g. DNS, connection refused). */
export class UnsplashNetworkError extends Error {
  constructor(message = "Unsplash request failed", options?: { cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "UnsplashNetworkError";
  }
}

/** Rate limited (e.g. 403 or 429 from Unsplash). */
export class UnsplashRateLimitError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: 403 | 429) {
    super(message);
    this.name = "UnsplashRateLimitError";
    this.statusCode = statusCode;
  }
}

/** Unauthorized — invalid or missing API key (401). */
export class UnsplashUnauthorizedError extends Error {
  readonly statusCode = 401;

  constructor(message: string) {
    super(message);
    this.name = "UnsplashUnauthorizedError";
  }
}

/** Resource not found (404). */
export class UnsplashNotFoundError extends Error {
  readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = "UnsplashNotFoundError";
  }
}

/** Other API error (4xx/5xx) with status code. */
export class UnsplashApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "UnsplashApiError";
    this.statusCode = statusCode;
  }
}

/** Response was not JSON (e.g. HTML error page). */
export class UnsplashNotJsonError extends Error {
  constructor(message = "Expected JSON response from Unsplash API") {
    super(message);
    this.name = "UnsplashNotJsonError";
  }
}

/** Response body could not be parsed as JSON. */
export class UnsplashParseError extends Error {
  constructor(
    message = "Failed to parse Unsplash API response",
    options?: { cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = "UnsplashParseError";
  }
}

/** Union of all Unsplash client errors for ReturnsError and exhaustive switches. */
export type UnsplashClientError =
  | UnsplashMockUseError
  | UnsplashNetworkError
  | UnsplashRateLimitError
  | UnsplashUnauthorizedError
  | UnsplashNotFoundError
  | UnsplashApiError
  | UnsplashNotJsonError
  | UnsplashParseError;

/** Type guard for rate limit (403 or 429). */
export function isUnsplashRateLimitError(
  value: unknown,
): value is UnsplashRateLimitError {
  return value instanceof UnsplashRateLimitError;
}

/**
 * Raw request to the Unsplash API. Adds Authorization and Accept-Version.
 * When isMocked, returns error — call layer should use mocks instead.
 */
export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ReturnsError<T, UnsplashClientError>> {
  if (isMocked) {
    return { error: new UnsplashMockUseError() };
  }

  const url = path.startsWith("http") ? path : `${UNSPLASH_API_BASE}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Client-ID ${apiKey!}`);
  headers.set("Accept-Version", "v1");

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (e) {
    return {
      error: new UnsplashNetworkError("Unsplash request failed", { cause: e }),
    };
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let message = `Unsplash API error: ${response.status}`;
    if (isJson) {
      try {
        const body = (await response.json()) as { errors?: string[] };
        if (Array.isArray(body.errors) && body.errors.length > 0) {
          message = body.errors.join("; ");
        }
      } catch {
        // use default message
      }
    }
    const statusCode = response.status;
    if (statusCode === 403 || statusCode === 429) {
      return {
        error: new UnsplashRateLimitError(message, statusCode as 403 | 429),
      };
    }
    if (statusCode === 401) {
      return { error: new UnsplashUnauthorizedError(message) };
    }
    if (statusCode === 404) {
      return { error: new UnsplashNotFoundError(message) };
    }
    return { error: new UnsplashApiError(message, statusCode) };
  }

  if (!isJson) {
    return { error: new UnsplashNotJsonError() };
  }

  try {
    const body = (await response.json()) as T;
    return { result: body };
  } catch (e) {
    return {
      error: new UnsplashParseError(
        "Failed to parse Unsplash API response",
        { cause: e },
      ),
    };
  }
}
