import { SecretType } from "@infisical/sdk";
import type { ScopedInfisicalClient } from "./client.ts";

/** Placeholder secret value returned by the mock for any getSecret call. */
const MOCK_SECRET_VALUE = "mock-secret-value";

export const mockInfisicalClient: ScopedInfisicalClient = {
  secrets: () => ({
    listSecrets: async () => ({ secrets: [] }),
    getSecret: async (options) => ({
      id: "mock-id",
      workspaceId: "mock-workspace",
      environment: options.environment,
      secretKey: options.secretName,
      secretValue: MOCK_SECRET_VALUE,
      secretValueHidden: false,
      isRotatedSecret: false,
      type: SecretType.Shared,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      tags: [],
    }),
  }),
};
