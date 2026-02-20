import { linkToProps, linkToHref, getHost } from "@saflib/links";
import { authLinks } from "@saflib/auth-links";
import { appLinks } from "@sderickson/hub-links";

/**
 * Returns props suitable for binding to the register CTA (e.g. v-btn).
 * Uses the auth register link so the button navigates to the auth app's register page.
 * Redirect after auth goes to the app SPA home (logged-in).
 */
export function getRegisterLinkProps() {
  const redirect =
    typeof window !== "undefined"
      ? linkToHref(appLinks.home, { domain: getHost() })
      : "";
  return linkToProps(authLinks.register, { params: { redirect } });
}
