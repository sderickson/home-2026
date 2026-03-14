import createError from "http-errors";

export const UNSPLASH_RATE_LIMIT_CODE = "UNSPLASH_RATE_LIMIT" as const;

/** Detect if a thrown value indicates Unsplash API rate limit (429). */
export function isUnsplashRateLimit(value: unknown): boolean {
  if (value instanceof Error) {
    const msg = value.message?.toLowerCase() ?? "";
    const status = (value as { status?: number }).status;
    return (
      status === 429 ||
      msg.includes("429") ||
      msg.includes("rate limit") ||
      msg.includes("too many requests")
    );
  }
  if (typeof value === "object" && value !== null) {
    const o = value as {
      status?: number;
      statusCode?: number;
      message?: string;
    };
    return (
      o.status === 429 ||
      o.statusCode === 429 ||
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
