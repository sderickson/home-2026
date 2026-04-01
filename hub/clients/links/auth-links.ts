import type { LinkMap } from "@saflib/links";
import { defaultKratosAuthLinks } from "@saflib/ory-kratos-sdk/links";

const subdomain = "auth";

export const authLinks: LinkMap = {
  /** Auth SPA shell home (fallback when a flow has no `return_to`). */
  home: {
    subdomain,
    path: "/",
  },
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view
  ...defaultKratosAuthLinks,
};
