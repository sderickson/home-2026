import type { EmailService } from "@saflib/email-service";
import type { SecretStore } from "@saflib/secret-store";
import { resolveEmailServiceFromEnv } from "@saflib/vendors-brevo";
import { configureUnsplash } from "@sderickson/recipes-unsplash";
import { configureSecretStore, getSecretStore } from "./secrets.ts";

let initialized = false;

/** Set in {@link initializeDependencies}. */
let emailClient: EmailService | undefined;

/**
 * Returns the shared Brevo-backed email service. Available after
 * {@link initializeDependencies} completes.
 */
export function getEmailClient(): EmailService {
  if (!emailClient) {
    emailClient = resolveEmailServiceFromEnv();
  }
  return emailClient;
}

/**
 * Initializes all process-level dependencies for the recipes service:
 * secret store, Brevo email client, then integration clients that need secrets.
 *
 * Idempotent — safe to call from multiple entry points (HTTP, cron, CLI).
 * Must be awaited before serving requests or handling Kratos courier callbacks.
 */
export async function initializeDependencies(): Promise<void> {
  if (initialized) return;

  configureSecretStore();
  const store: SecretStore = getSecretStore();
  emailClient = resolveEmailServiceFromEnv();
  await configureUnsplash(store);

  initialized = true;
}
