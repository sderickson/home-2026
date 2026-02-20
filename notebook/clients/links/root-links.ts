import type { LinkMap } from "@saflib/links";

const subdomain = "notebook";

console.log(
  "TODO: Remove this log once rootLinks is being used by the routes",
  subdomain,
);

export const rootLinks: LinkMap = {
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view




  home: {
    subdomain,
    path: "/",
  },
  // END WORKFLOW AREA
};
