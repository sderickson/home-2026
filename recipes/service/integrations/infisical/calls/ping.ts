import { infisical, isMocked } from "../client.ts";
import { typedEnv } from "../env.ts";

/**
 * Read-only API call to verify the integration: lists secrets for the configured project and environment.
 * Uses listSecrets (safe list operation); in mock mode returns a placeholder response.
 */
export async function ping() {
  if (isMocked) {
    return infisical.secrets().listSecrets({
      projectId: "mock-project",
      environment: "dev",
    });
  }
  const projectId = typedEnv.INFISICAL_PROJECT_ID;
  const environment = typedEnv.INFISICAL_ENVIRONMENT;
  if (!projectId || !environment) {
    throw new Error(
      "INFISICAL_PROJECT_ID and INFISICAL_ENVIRONMENT are required for ping. Set them in your environment or .env file.",
    );
  }
  return infisical.secrets().listSecrets({ projectId, environment });
}
