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
