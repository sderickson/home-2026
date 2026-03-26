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

/** Resolves Kratos `return_to` for `createBrowserLoginFlow`: `?redirect=` or default post-auth fallback URL. */
export function resolveLoginBrowserReturnTo(
  redirectQueryParam: unknown,
  fallbackRecipesHomeHref: string,
): string {
  if (typeof redirectQueryParam === "string" && redirectQueryParam.trim()) {
    return redirectQueryParam.trim();
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
  if (!method) {
    // Some browser/component submit paths omit the submit-button pair. Infer method from known fields.
    if (String(fd.get("password") ?? "").trim() || String(fd.get("identifier") ?? "").trim()) {
      method = "password";
    } else if (String(fd.get("totp_code") ?? "").trim()) {
      method = "totp";
    }
  }
  if (!method) {
    throw new Error("Missing login method in form");
  }
  const body = Object.fromEntries(Array.from(fd.entries()).map(([k, v]) => [k, String(v)])) as Record<
    string,
    string
  >;
  if (body.identifier) {
    body.identifier = body.identifier.trim();
  }
  return {
    ...body,
    method,
  } as UpdateLoginFlowBody;
}
