import createError from "http-errors";

export const UNSPLASH_RATE_LIMIT_CODE = "UNSPLASH_RATE_LIMIT" as const;

function statusIs429(o: unknown): boolean {
  if (o == null || typeof o !== "object") return false;
  const s = o as { status?: number; statusCode?: number };
  return s.status === 429 || s.statusCode === 429;
}

/**
 * unsplash-js throws DecodingError (no .status) when 429 has non-JSON body.
 * Treat those as rate limit so we return 429 instead of 502.
 */
function isUnsplashDecodingError(value: unknown): boolean {
  if (!(value instanceof Error)) return false;
  const msg = value.message?.toLowerCase() ?? "";
  return (
    msg.includes("json response") ||
    msg.includes("parse json") ||
    msg.includes("unable to parse json")
  );
}

/** Detect if a thrown value indicates Unsplash API rate limit (429). */
export function isUnsplashRateLimit(value: unknown): boolean {
  if (value instanceof Error) {
    const msg = value.message?.toLowerCase() ?? "";
    const v = value as { status?: number; response?: { status?: number; statusCode?: number }; cause?: unknown };
    return (
      v.status === 429 ||
      statusIs429(v.response) ||
      (v.cause != null && isUnsplashRateLimit(v.cause)) ||
      msg.includes("429") ||
      msg.includes("rate limit") ||
      msg.includes("too many requests") ||
      isUnsplashDecodingError(value)
    );
  }
  if (typeof value === "object" && value !== null) {
    const o = value as {
      status?: number;
      statusCode?: number;
      response?: { status?: number; statusCode?: number };
      message?: string;
    };
    return (
      statusIs429(o) ||
      statusIs429(o.response) ||
      String(o.message ?? "").toLowerCase().includes("rate limit")
    );
  }
  const s = String(value);
  return s.includes("429") || s.toLowerCase().includes("rate limit");
}

/** Throw 429 with UNSPLASH_RATE_LIMIT code for use in Unsplash endpoints. */
export function throwUnsplashRateLimitError(): never {
  throw createError(429, "Unsplash rate limit exceeded.", {
    code: UNSPLASH_RATE_LIMIT_CODE,
  });
}
