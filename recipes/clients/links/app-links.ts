import type { LinkMap } from "@saflib/links";

const subdomain = "app.recipes";

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
  recipesEdit: {
    subdomain,
    path: "/recipes/:id/edit",
  },
  // END WORKFLOW AREA
};
