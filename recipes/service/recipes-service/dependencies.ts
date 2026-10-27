import {
  configureSecretStore,
  getSecretStore,
} from "@saflib/vendors-infisical";
import { configureEmail } from "@saflib/vendors-brevo";
import { setEmailClient } from "@sderickson/recipes-service-common";
import { configureUnsplash } from "@sderickson/recipes-unsplash";

let initialized = false;

/**
 * Initializes all process-level dependencies for the recipes service: the
 * Infisical secret store (mock when `INFISICAL_TOKEN=mock` / test), the Brevo
 * email client, then integration clients that need secrets. The composition
 * root owns this wiring.
 *
 * Idempotent — safe to call from multiple entry points (HTTP, cron, CLI).
 * Must be awaited before serving requests or handling Kratos courier callbacks.
 */
export async function initializeDependencies(): Promise<void> {
  if (initialized) return;

  configureSecretStore();
  const store = getSecretStore();
  setEmailClient(await configureEmail(store));
  await configureUnsplash(store);

  initialized = true;
}
