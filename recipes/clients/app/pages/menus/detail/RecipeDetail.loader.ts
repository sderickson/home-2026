import { getMenuQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { useDetailLoader } from "../../recipes/detail/Detail.loader.ts";

/**
 * Loader for recipe detail when viewed from a menu.
 * Reads menuId, recipeId, collectionId from route and fetches recipe detail + menu (for breadcrumbs).
 */
export function useMenuRecipeDetailLoader() {
  const route = useRoute();
  const menuId = route.params.menuId as string;
  const recipeId = route.params.recipeId as string;
  const collectionId = route.params.collectionId as string;

  const recipeQueries = useDetailLoader({ recipeId, collectionId });
  const menuQuery = useQuery(getMenuQuery(menuId, collectionId));

  return {
    ...recipeQueries,
    menuQuery,
  };
}
