import type { UpdateLoginFlowBody } from "@ory/client";

/**
 * Pure helpers for Kratos login (browser flow + form submit).
 */

/** Where to send the browser after a successful login: Kratos `return_to` or the injected hub app fallback URL. */
export function destinationAfterLogin(
  flowReturnTo: string | null | undefined,
  fallbackRecipesHomeHref: string,
): string {
  const u = flowReturnTo?.trim();
  return u || fallbackRecipesHomeHref;
}

/** Resolves Kratos `return_to` for browser flows: `?return_to=` or default post-auth fallback URL. */
export function resolveLoginBrowserReturnTo(
  returnToQueryParam: unknown,
  fallbackRecipesHomeHref: string,
): string {
  if (typeof returnToQueryParam === "string" && returnToQueryParam.trim()) {
    return returnToQueryParam.trim();
  }
  return fallbackRecipesHomeHref;
}

export function credentialsFromLoginForm(fd: FormData): { identifier: string; password: string } {
  return {
    identifier: String(fd.get("identifier") ?? "").trim(),
    password: String(fd.get("password") ?? ""),
  };
}

/**
 * Build a login submit body for any Kratos login method available in the flow (password, totp, ...).
 */
export function buildLoginUpdateBodyFromFormData(fd: FormData): UpdateLoginFlowBody {
  let method = String(fd.get("method") ?? "").trim();

  const passkeyLogin = String(fd.get("passkey_login") ?? "").trim();
  const webauthnLogin = String(fd.get("webauthn_login") ?? "").trim();

  // Passkey / WebAuthn responses must win over `method` and identifier/password heuristics: the form
  // still has `identifier` (and often `method=password` from the other submit control) while Ory fills
  // `passkey_login` after the ceremony.
  if (passkeyLogin) {
    method = "passkey";
  } else if (webauthnLogin) {
    method = "webauthn";
  } else if (!method) {
    if (String(fd.get("totp_code") ?? "").trim()) {
      method = "totp";
    } else if (
      String(fd.get("code") ?? "").trim() ||
      String(fd.get("resend") ?? "").trim()
    ) {
      // Email/SMS OTP as second factor (AAL2); `resend` submits without a code to request a new one.
      method = "code";
    } else if (
      String(fd.get("password") ?? "").trim() ||
      String(fd.get("identifier") ?? "").trim()
    ) {
      method = "password";
    }
  }
  if (!method) {
    throw new Error("Missing login method in form");
  }
  const body: Record<string, string> = {};
  fd.forEach((value, key) => {
    body[key] = String(value);
  });
  if (body.identifier) {
    body.identifier = body.identifier.trim();
  }
  return {
    ...body,
    method,
  } as UpdateLoginFlowBody;
}
