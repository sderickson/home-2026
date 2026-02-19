import { linkToProps } from "@saflib/links";
import { accountLinks } from "@sderickson/hub-links";

/**
 * Asserts that profile data is loaded. The Async component only renders the page
 * when loader queries are ready, so this is a guard for type narrowing and consistency.
 */
export function assertProfileLoaded(profile: unknown): asserts profile {
  if (!profile) {
    throw new Error("Failed to load profile");
  }
}

/**
 * Returns props suitable for binding to the profile link (e.g. v-btn).
 */
export function getProfileLinkProps() {
  return linkToProps(accountLinks.profile);
}

/**
 * Returns props suitable for binding to the password link (e.g. v-btn).
 */
export function getPasswordLinkProps() {
  return linkToProps(accountLinks.password);
}
