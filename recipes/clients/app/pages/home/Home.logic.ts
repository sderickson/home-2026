import { linkToProps, linkToHref, getHost } from "@saflib/links";
import { authLinks } from "@saflib/auth-links";
import { appLinks } from "@sderickson/recipes-links";
import { setDemoMode } from "@sderickson/recipes-clients-common";

/**
 * Returns props for the login CTA. Redirect after login goes to recipes app home.
 */
export function getLoginLinkProps() {
  const redirect =
    typeof window !== "undefined"
      ? linkToHref(appLinks.home, { domain: getHost() })
      : "";
  return linkToProps(authLinks.login, { params: { redirect } });
}

/**
 * Turn on demo mode and reload so MSW and seed data run.
 */
export function enterDemoModeFromError() {
  setDemoMode(true);
  window.location.reload();
}
