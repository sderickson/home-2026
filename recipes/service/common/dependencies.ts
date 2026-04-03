import { createEmailService, type EmailService } from "@saflib/email-service";
import type { SecretStore } from "@saflib/secret-store";
import { configureUnsplash } from "@sderickson/recipes-unsplash";
import { configureSecretStore, getSecretStore } from "./secrets.ts";

let initialized = false;

/** Set in {@link initializeDependencies} using the `BREVO_API_KEY` secret. */
let emailClient: EmailService | undefined;

async function configureEmail(store: SecretStore): Promise<void> {
  if (emailClient) return;

  const out = await store.getSecretByName("BREVO_API_KEY");
  console.log("BREVO_API_KEY", out);
  let apiKey: string | "mock";
  if (out.result !== undefined && out.result.trim() !== "") {
    apiKey = out.result.trim();
  } else {
    console.warn(
      "[email] BREVO_API_KEY not found in secret store, using mock:",
      out.error?.message,
    );
    apiKey = "mock";
  }

  emailClient = createEmailService({ type: "brevo", apiKey });
}

/**
 * Returns the shared Brevo-backed email service. Available after
 * {@link initializeDependencies} completes.
 */
export function getEmailClient(): EmailService {
  if (!emailClient) {
    throw new Error(
      "Email client not initialized. Call initializeDependencies() first.",
    );
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
  const store = getSecretStore();
  await configureEmail(store);
  await configureUnsplash(store);

  initialized = true;
}
