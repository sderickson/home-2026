import type { LinkMap } from "@saflib/links";

const subdomain = "account";

export const accountLinks: LinkMap = {
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view

  home: {
    subdomain,
    path: "/",
  },
  password: {
    subdomain,
    path: "/password",
  },
  profile: {
    subdomain,
    path: "/profile",
  },
  // END WORKFLOW AREA
};
