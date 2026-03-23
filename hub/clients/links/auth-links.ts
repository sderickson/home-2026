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
   * Kratos registration UI. Use `params.redirect` (full URL) so Kratos stores `return_to`
   * on the flow and the auth SPA can send the user back after success.
   */
  kratosRegistration: {
    subdomain,
    path: "/registration",
    params: ["redirect"],
  },
  // END WORKFLOW AREA
};
