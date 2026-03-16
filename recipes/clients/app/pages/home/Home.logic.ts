import { linkToProps, linkToHref, getHost } from "@saflib/links";
import { authLinks } from "@saflib/auth-links";
import { appLinks } from "@sderickson/recipes-links";
import { setDemoMode } from "@sderickson/recipes-clients-common";

/**
 * Asserts that profile data is loaded. The AsyncPage only renders the page when
 * loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertProfileLoaded(profile: unknown): asserts profile {
  if (!profile) {
    throw new Error("Failed to load profile");
  }
}

/**
 * Asserts that collections list data is loaded.
 */
export function assertCollectionsLoaded(data: unknown): asserts data {
  if (data === undefined || data === null) {
    throw new Error("Failed to load collections");
  }
}

/**
 * Returns the collections array from list data, or empty array.
 */
export function getCollectionsList<T>(data: T[] | undefined): T[] {
  return data ?? [];
}

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
