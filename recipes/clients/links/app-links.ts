import type { LinkMap } from "@saflib/links";

const subdomain = "app.recipes";

export const appLinks: LinkMap = {
  // BEGIN WORKFLOW AREA page-links FOR vue/add-view

  /** Recipes app home; post-registration / post-login landing from hub auth (`app.recipes.<domain>` in dev). */
  home: {
    subdomain,
    path: "/",
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
  menusCreate: {
    subdomain,
    path: "/c/:collectionId/menus/create",
  },
  menusDetail: {
    subdomain,
    path: "/c/:collectionId/menus/:id",
  },
  /** Recipe detail when navigated from a menu (same content, menu breadcrumbs). */
  menuRecipeDetail: {
    subdomain,
    path: "/c/:collectionId/menus/:menuId/recipes/:recipeId",
  },
  collectionsDetail: {
    subdomain,
    path: "/c/:collectionId",
  },
  // END WORKFLOW AREA
};
