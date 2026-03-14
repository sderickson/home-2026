import type { LinkMap } from "@saflib/links";

const subdomain = "app.recipes";

export const appLinks: LinkMap = {
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view

  home: {
    subdomain,
    path: "/",
  },
  collectionsHome: {
    subdomain,
    path: "/collections",
  },
  collectionsList: {
    subdomain,
    path: "/collections",
  },
  recipesList: {
    subdomain,
    path: "/c/:collectionId/recipes/list",
  },
  recipesDetail: {
    subdomain,
    path: "/c/:collectionId/recipes/:id",
  },
  recipesCreate: {
    subdomain,
    path: "/c/:collectionId/recipes/create",
  },
  recipesEdit: {
    subdomain,
    path: "/c/:collectionId/recipes/:id/edit",
  },
  menusList: {
    subdomain,
    path: "/c/:collectionId/menus/list",
  },
  menusCreate: {
    subdomain,
    path: "/c/:collectionId/menus/create",
  },
  menusDetail: {
    subdomain,
    path: "/c/:collectionId/menus/:id",
  },
  // END WORKFLOW AREA
};
