import { createSecretStore, type SecretStore } from "@saflib/secret-store";
import { typedEnv } from "./env.ts";

const apiKey = typedEnv.INFISICAL_TOKEN;
const isTest = typedEnv.NODE_ENV === "test";

if (!apiKey && !isTest) {
  throw new Error(
    "INFISICAL_TOKEN is required. Set it in your environment or .env file.",
  );
}

const isMocked = apiKey === "mock" || isTest;
const accessToken = isMocked ? "mock" : (apiKey as string);

/**
 * Shared Infisical-backed secret store for recipes services.
 */
export const recipesSecretStore: SecretStore = createSecretStore({
  type: "infisical",
  options: {
    accessToken,
    projectId: typedEnv.INFISICAL_PROJECT_ID ?? "",
    environment: typedEnv.INFISICAL_ENVIRONMENT ?? "",
  },
});
