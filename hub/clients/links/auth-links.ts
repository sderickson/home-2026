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
  // END WORKFLOW AREA
};
