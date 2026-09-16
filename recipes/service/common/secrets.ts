import {
  configureSecretStore as configureInfisicalSecretStore,
  getSecretStore,
  resetSecretStoreForTests,
} from "@saflib/vendors-infisical";

/**
 * Initializes the shared secret store via Infisical (or mock when
 * `INFISICAL_TOKEN=mock` / test). Idempotent — subsequent calls are no-ops.
 * Must be called before {@link getSecretStore}.
 */
export function configureSecretStore(): void {
  configureInfisicalSecretStore();
}

export { getSecretStore, resetSecretStoreForTests };
