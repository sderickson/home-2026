import type { ReturnsError } from "@saflib/monorepo";
import { infisical, isMocked } from "../client.ts";
import { typedEnv } from "../env.ts";
import { mockGetSecretByName } from "./get-secret-by-name.mocks.ts";

// ---------------------------------------------------------------------------
// Error classes — map SDK errors for exhaustive handling
// ---------------------------------------------------------------------------

/** Secret was not found (e.g. SDK 404). */
export class InfisicalNotFoundError extends Error {
  constructor(message = "Secret not found") {
    super(message);
    this.name = "InfisicalNotFoundError";
  }
}

/** Unauthorized — invalid or missing token (e.g. SDK 401/403). */
export class InfisicalUnauthorizedError extends Error {
  constructor(message = "Infisical authentication failed") {
    super(message);
    this.name = "InfisicalUnauthorizedError";
  }
}

/** Network or request failure (e.g. connection refused, timeout). */
export class InfisicalNetworkError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "InfisicalNetworkError";
  }
}

/** Union of all Infisical client errors for ReturnsError and exhaustive switches. */
export type InfisicalClientError =
  | InfisicalNotFoundError
  | InfisicalUnauthorizedError
  | InfisicalNetworkError;

/**
 * Maps a thrown SDK error to an InfisicalClientError.
 * Infisical SDK throws errors with message containing [StatusCode=N]; we parse that or use message/code for network errors.
 */
function mapSdkError(err: unknown): InfisicalClientError {
  const message = err instanceof Error ? err.message : String(err);
  const statusMatch = message.match(/\[StatusCode=(\d+)\]/);
  const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : null;

  if (statusCode === 404) {
    return new InfisicalNotFoundError(message);
  }
  if (statusCode === 401 || statusCode === 403) {
    return new InfisicalUnauthorizedError(message);
  }

  const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : null;
  const isNetwork =
    statusCode == null &&
    (code === "ECONNREFUSED" ||
      code === "ETIMEDOUT" ||
      code === "ENOTFOUND" ||
      /network|timeout|ECONNREFUSED|ETIMEDOUT/i.test(message));

  if (isNetwork) {
    return new InfisicalNetworkError(message, { cause: err });
  }

  return new InfisicalNetworkError(message, { cause: err });
}

/**
 * Fetch the value of a secret by name from Infisical.
 * Uses INFISICAL_PROJECT_ID and INFISICAL_ENVIRONMENT from env for the real API call.
 * When isMocked or MOCK_INTEGRATIONS is set, returns the mock value.
 */
export async function getSecretByName(
  name: string,
): Promise<ReturnsError<string, InfisicalClientError>> {
  if (isMocked || typedEnv.MOCK_INTEGRATIONS === "true") {
    return mockGetSecretByName(name);
  }

  const projectId = typedEnv.INFISICAL_PROJECT_ID;
  const environment = typedEnv.INFISICAL_ENVIRONMENT;
  if (!projectId || !environment) {
    return {
      error: new InfisicalNetworkError(
        "INFISICAL_PROJECT_ID and INFISICAL_ENVIRONMENT are required. Set them in your environment or .env file.",
      ),
    };
  }

  try {
    const secret = await infisical.secrets.getSecret({
      projectId,
      environment,
      secretName: name,
    });
    return { result: secret.secretValue };
  } catch (err) {
    return { error: mapSdkError(err) };
  }
}
