import type { ReturnsError } from "@saflib/monorepo";
import type { InfisicalClientError } from "./get-secret-by-name.ts";

const MOCK_SECRET_VALUE = "mock-secret-value";

/**
 * Returns a mock result for getSecretByName (used when isMocked or MOCK_INTEGRATIONS is set).
 * If process.env has a value for the given secret name, returns that; otherwise returns the mock value.
 */
export function mockGetSecretByName(
  name: string,
): ReturnsError<string, InfisicalClientError> {
  const fromEnv =
    typeof process !== "undefined" &&
    process.env &&
    typeof process.env[name] === "string" &&
    process.env[name]!.trim() !== ""
      ? process.env[name]!.trim()
      : null;
  return { result: fromEnv ?? MOCK_SECRET_VALUE };
}
