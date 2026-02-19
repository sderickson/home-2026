import type { LinkMap } from "@saflib/links";

const subdomain = "app.notebook";

console.log(
  "TODO: Remove this log once appLinks is being used by the routes",
  subdomain,
);

export const appLinks: LinkMap = {
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view

  home: {
    subdomain,
    path: "/",
  },
  // END WORKFLOW AREA
};
