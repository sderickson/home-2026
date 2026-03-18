import { InfisicalSDK } from "@infisical/sdk";
import { typedEnv } from "./env.ts";
import { mockInfisicalClient } from "./client.mocks.ts";

const apiKey = typedEnv.INFISICAL_TOKEN;
const isTest = typedEnv.NODE_ENV === "test";

// IMPORTANT: Do not change these two gates. See @saflib/integrations docs for rationale.
// Gate 1: Throw if key is missing outside of tests (catches misconfiguration).
if (!apiKey && !isTest) {
  throw new Error(
    "INFISICAL_TOKEN is required. Set it in your environment or .env file.",
  );
}
// Gate 2: Mock when key is explicitly "mock" or in tests. Missing key !== mock.
export const isMocked = apiKey === "mock" || isTest;

type InfisicalApi = InstanceType<typeof InfisicalSDK>;
type SecretsClient = ReturnType<InfisicalApi["secrets"]>;
export type ScopedInfisicalClient = {
  secrets: () => Pick<SecretsClient, "getSecret" | "listSecrets">;
};

let infisicalClient: ScopedInfisicalClient;

if (isMocked) {
  infisicalClient = mockInfisicalClient;
} else {
  const sdk = new InfisicalSDK();
  sdk.auth().accessToken(apiKey as string);
  infisicalClient = sdk;
}

export const infisical = infisicalClient;
