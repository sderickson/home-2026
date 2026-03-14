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

/** Error from the Unsplash client (network, 4xx/5xx, rate limit). */
export class UnsplashClientError extends Error {
  readonly statusCode?: number;
  readonly code?: string;

  constructor(
    message: string,
    options?: { cause?: unknown; statusCode?: number; code?: string },
  ) {
    super(message, { cause: options?.cause });
    this.name = "UnsplashClientError";
    this.statusCode = options?.statusCode;
    this.code = options?.code;
  }
}

/** True if the error indicates Unsplash rate limit (429). */
export function isUnsplashRateLimitError(
  value: unknown,
): value is UnsplashClientError {
  return (
    value instanceof UnsplashClientError &&
    (value.statusCode === 429 || value.code === "UNSPLASH_RATE_LIMIT")
  );
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
    return {
      error: new UnsplashClientError(
        "Unsplash client must not be used when mocking; use call mocks.",
        { code: "MOCK_USE_CLIENT" },
      ),
    };
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
      error: new UnsplashClientError("Unsplash request failed", { cause: e }),
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
    return {
      error: new UnsplashClientError(message, {
        statusCode,
        code:
          statusCode === 429 ? "UNSPLASH_RATE_LIMIT" : "UNSPLASH_API_ERROR",
      }),
    };
  }

  if (!isJson) {
    return {
      error: new UnsplashClientError(
        "Expected JSON response from Unsplash API",
        { code: "UNSPLASH_NOT_JSON" },
      ),
    };
  }

  try {
    const body = (await response.json()) as T;
    return { result: body };
  } catch (e) {
    return {
      error: new UnsplashClientError(
        "Failed to parse Unsplash API response",
        { cause: e },
      ),
    };
  }
}
