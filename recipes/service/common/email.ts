import type { EmailService } from "@saflib/email-service";
import { createEmailService } from "@saflib/vendors-brevo";

let emailClient: EmailService | undefined;

/**
 * Sets the shared email service. The composition root
 * (`@sderickson/recipes-service`'s `initializeDependencies`) builds it from
 * the secret store; this package only holds the handle.
 */
export function setEmailClient(client: EmailService): void {
  emailClient = client;
}

/**
 * Returns the shared email service. Available after the composition root's
 * `initializeDependencies()` completes; tests always get the mock.
 */
export function getEmailClient(): EmailService {
  if (process.env.NODE_ENV === "test") {
    return createEmailService("mock");
  }
  if (!emailClient) {
    throw new Error(
      "Email client not initialized. Call initializeDependencies() from @sderickson/recipes-service first.",
    );
  }
  return emailClient;
}
