import { linkToProps } from "@saflib/links";
import { authLinks } from "@saflib/auth-links";

/**
 * Returns props suitable for binding to the register CTA (e.g. v-btn).
 * Uses the auth register link so the button navigates to the auth app's register page.
 */
export function getRegisterLinkProps() {
  return linkToProps(authLinks.register);
}
