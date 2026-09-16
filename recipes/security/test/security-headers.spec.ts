import { expect, test } from "@playwright/test";
import { spaOrigin } from "@saflib/security/origins/urls";
import { assertSecurityHeaders } from "@saflib/security/http/headers";

/**
 * Dev / prod-local: SPA subdomain roots must carry edge security headers.
 * Includes hub auth/account (shared) and recipes product SPAs.
 */
const SPA_SUBDOMAINS = [
  "app.recipes",
  "admin.recipes",
  "account.recipes",
  "auth",
  "account",
  "app",
] as const;

for (const sub of SPA_SUBDOMAINS) {
  test(`SPA root ${sub} exposes security headers`, async ({ request }) => {
    const url = `${spaOrigin(sub)}/`;
    const res = await request.get(url);
    expect(res.ok(), `GET ${url} → ${res.status()}`).toBe(true);
    assertSecurityHeaders(res.headers(), { allowDevDevtoolsFraming: true });
  });
}
