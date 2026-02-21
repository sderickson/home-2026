import type { LinkMap } from "@saflib/links";

const subdomain = "app.recipes";

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
  recipesList: {
    subdomain,
    path: "/recipes/list",
  },
  recipesDetail: {
    subdomain,
    path: "/recipes/:id",
  },
  recipesCreate: {
    subdomain,
    path: "/recipes/create",
  },
  // END WORKFLOW AREA
};
