import type { ReturnsError } from "@saflib/monorepo";
import type { InfisicalClientError } from "./get-secret-by-name.ts";

const MOCK_SECRET_VALUE = "mock-secret-value";

/**
 * Returns a mock result for getSecretByName (used when isMocked or MOCK_INTEGRATIONS is set).
 */
export function mockGetSecretByName(
  _name: string,
): ReturnsError<string, InfisicalClientError> {
  return { result: MOCK_SECRET_VALUE };
}
