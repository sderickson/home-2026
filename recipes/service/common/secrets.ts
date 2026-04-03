import { createSecretStore, type SecretStore } from "@saflib/secret-store";
import { typedEnv } from "./env.ts";

const apiKey = typedEnv.INFISICAL_TOKEN;
const isTest = typedEnv.NODE_ENV === "test";

// Align with @sderickson/recipes-infisical client.ts — fail fast when misconfigured.
if (!apiKey && !isTest) {
  throw new Error(
    "INFISICAL_TOKEN is required. Set it in your environment or .env file.",
  );
}

const isMocked = apiKey === "mock" || isTest;
const accessToken = isMocked ? "mock" : (apiKey as string);

/**
 * Shared Infisical-backed secret store for recipes services. Respects the same
 * mock gates as the Infisical integration (`mock` token, `NODE_ENV=test`, `MOCK_INTEGRATIONS=true`).
 */
export const recipesSecretStore: SecretStore = createSecretStore({
  type: "infisical",
  options: {
    accessToken,
    projectId: typedEnv.INFISICAL_PROJECT_ID ?? "",
    environment: typedEnv.INFISICAL_ENVIRONMENT ?? "",
  },
});
