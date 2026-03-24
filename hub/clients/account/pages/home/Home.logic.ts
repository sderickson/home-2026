import type { Session } from "@ory/client";
import { linkToProps } from "@saflib/links";
import { accountLinks } from "@sderickson/hub-links";

/**
 * Asserts Kratos session with identity is present (required-session loader).
 */
export function assertProfileLoaded(session: unknown): asserts session is Session {
  if (!session || !(session as Session).identity) {
    throw new Error("Failed to load session");
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
