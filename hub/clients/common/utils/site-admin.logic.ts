/** Parse comma-separated admin emails (mirrors server `ADMIN_EMAILS`). */
export function parseAdminEmails(raw: string | undefined | null): string[] {
  if (raw == null || raw === "") {
    return [];
  }
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Client-side site-admin check for nav chrome.
 * Prefer `VITE_ADMIN_EMAILS` (mirror of server `ADMIN_EMAILS`).
 */
export function getConfiguredAdminEmails(): string[] {
  return parseAdminEmails(
    import.meta.env.VITE_ADMIN_EMAILS as string | undefined,
  );
}

export function isSiteAdminEmail(
  email: string | null | undefined,
  adminEmails: readonly string[] = getConfiguredAdminEmails(),
): boolean {
  if (email == null || email === "") {
    return false;
  }
  return adminEmails.includes(email.toLowerCase());
}
