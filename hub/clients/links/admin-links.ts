import type { LinkMap } from "@saflib/links";

const subdomain = "admin";

export const adminLinks: LinkMap = {
  home: {
    subdomain,
    path: "/",
  },
  users: {
    subdomain,
    path: "/users",
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
  opsTokens: {
    subdomain,
    path: "/ops-tokens",
  },
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view
  // END WORKFLOW AREA
};
