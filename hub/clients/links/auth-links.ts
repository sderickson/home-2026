import type { LinkMap } from "@saflib/links";

const subdomain = "auth";

console.log(
  "TODO: Remove this log once authLinks is being used by the routes",
  subdomain,
);

export const authLinks: LinkMap = {
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view

  register: {
    subdomain,
    path: "/register",
  },
  logout: {
    subdomain,
    path: "/logout",
  },
  // END WORKFLOW AREA
};
