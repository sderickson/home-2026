import type { LinkMap } from "@saflib/links";

const subdomain = "recipes";

export const rootLinks: LinkMap = {
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
  // END WORKFLOW AREA
};
