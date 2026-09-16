import type { LinkMap } from "@saflib/links";

const subdomain = "admin";

export const adminLinks: LinkMap = {
  home: {
    subdomain,
    path: "/",
  },
  logs: {
    subdomain,
    path: "/logs",
  },
  metrics: {
    subdomain,
    path: "/metrics",
  },
  events: {
    subdomain,
    path: "/events",
  },
  errors: {
    subdomain,
    path: "/errors",
  },
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view
  // END WORKFLOW AREA
};
