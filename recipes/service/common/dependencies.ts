import { configureSecretStore, getSecretStore } from "./secrets.ts";
import { configureUnsplash } from "@sderickson/recipes-unsplash";

let initialized = false;

/**
 * Initializes all process-level dependencies for the recipes service:
 * secret store, then integration clients that need secrets.
 *
 * Idempotent — safe to call from multiple entry points (HTTP, cron, CLI).
 * Must be awaited before serving requests.
 */
export async function initializeDependencies(): Promise<void> {
  if (initialized) return;

  configureSecretStore();
  await configureUnsplash(getSecretStore());

  initialized = true;
}
