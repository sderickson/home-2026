import { linkToProps, linkToHref, getHost } from "@saflib/links";
import { appLinks, authLinks } from "@sderickson/hub-links";

function postAuthRedirectHref() {
  return typeof window !== "undefined"
    ? linkToHref(appLinks.home, { domain: getHost() })
    : "";
}

/**
 * Props for the register CTA: auth registration with `return_to` = hub app home.
 */
export function getRegisterLinkProps() {
  return linkToProps(authLinks.newRegistration, {
    params: { return_to: postAuthRedirectHref() },
  });
}

/**
 * Props for the login CTA: auth login with `return_to` = hub app home.
 */
export function getLoginLinkProps() {
  return linkToProps(authLinks.newLogin, {
    params: { return_to: postAuthRedirectHref() },
  });
}
