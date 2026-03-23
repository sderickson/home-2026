import type { LinkMap } from "@saflib/links";

const subdomain = "auth";

export const authLinks: LinkMap = {
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view
  kratosRegistration: {
    subdomain,
    path: "/registration",
  },
  // END WORKFLOW AREA
};
