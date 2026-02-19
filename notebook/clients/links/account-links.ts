import type { LinkMap } from "@saflib/links";

const subdomain = "account.notebook";

console.log(
  "TODO: Remove this log once accountLinks is being used by the routes",
  subdomain,
);

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
