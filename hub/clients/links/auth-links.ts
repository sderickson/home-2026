import type { LinkMap } from "@saflib/links";

const subdomain = "auth";

export const authLinks: LinkMap = {
  /** Auth SPA shell home (fallback when a flow has no `return_to`). */
  home: {
    subdomain,
    path: "/",
  },
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view
  /**
   * Kratos registration UI. Use `params.redirect` (full URL) for `return_to`, or resume with
   * `params.flow` (Kratos flow id). After a browser flow is created, the page replaces the URL
   * with `?flow=` so refresh keeps the same flow.
   */
  kratosRegistration: {
    subdomain,
    path: "/registration",
    params: ["redirect", "flow"],
  },
  /**
   * Kratos login UI. Use `params.redirect` (full URL) for `return_to`, or resume with
   * `params.flow` (Kratos flow id). After a browser flow is created, the page replaces the URL
   * with `?flow=` so refresh keeps the same flow.
   */
  kratosLogin: {
    subdomain,
    path: "/login",
    params: ["redirect", "flow"],
  },
  /**
   * Kratos email verification (code flow). Use `params.redirect` (full URL) for `return_to`, resume
   * with `params.flow` (Kratos flow id from email links), optional `params.token` when the courier
   * includes it. After a browser flow is created, the page replaces the URL with `?flow=`.
   */
  kratosVerification: {
    subdomain,
    path: "/verification",
    params: ["redirect", "flow", "token"],
  },
  /**
   * Shared gate when the user is signed in but email is not verified. Use `params.redirect` (full
   * URL) for where to send them after verification (e.g. recipes home).
   */
  kratosVerifyWall: {
    subdomain,
    path: "/verify-wall",
    params: ["redirect"],
  },
  // END WORKFLOW AREA
};
