import type { LinkMap } from "@saflib/links";

const subdomain = "account";

export const accountLinks: LinkMap = {
  home: {
    subdomain,
    path: "/",
  },
  /** Kratos identity traits (email / name) via settings `profile` group. */
  profile: {
    subdomain,
    path: "/profile",
  },
  /** Kratos identity email / profile traits (settings `profile` group). */
  email: {
    subdomain,
    path: "/email",
  },
  password: {
    subdomain,
    path: "/password",
  },
  /** TOTP / authenticator app (settings `totp` group). */
  mfa: {
    subdomain,
    path: "/mfa",
    params: ["return_to"],
  },
  sessions: {
    subdomain,
    path: "/sessions",
  },
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view
  // END WORKFLOW AREA
};
