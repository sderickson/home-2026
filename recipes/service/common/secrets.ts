import { createSecretStore, type SecretStore } from "@saflib/secret-store";
import { typedEnv } from "./env.ts";

let secretStore: SecretStore | undefined;

/**
 * Initializes the shared secret store. Idempotent — subsequent calls are no-ops.
 * Must be called before {@link getSecretStore}.
 */
export function configureSecretStore(): void {
  if (secretStore) return;

  const apiKey = typedEnv.INFISICAL_TOKEN;
  const isTest = typedEnv.NODE_ENV === "test";

  if (!apiKey && !isTest) {
    throw new Error(
      "INFISICAL_TOKEN is required. Set it in your environment or .env file.",
    );
  }

  const isMocked = apiKey === "mock" || isTest;
  const accessToken = isMocked ? "mock" : (apiKey as string);

  secretStore = createSecretStore({
    type: "infisical",
    options: {
      accessToken,
      projectId: typedEnv.INFISICAL_PROJECT_ID ?? "",
      environment: typedEnv.INFISICAL_ENVIRONMENT ?? "",
    },
  });
}

export function getSecretStore(): SecretStore {
  if (!secretStore) {
    throw new Error(
      "Secret store not initialized. Call configureSecretStore() first.",
    );
  }
  return secretStore;
}
