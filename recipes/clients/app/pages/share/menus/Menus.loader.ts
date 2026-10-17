import { sharedGetMenusQuery } from "@sderickson/recipes-sdk/requests/menus/shared-get";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useMenusLoader() {
  const route = useRoute();
  const menuId = route.params.id as string;

  return {
    sharedMenuQuery: useQuery(sharedGetMenusQuery(menuId)),
  };
}
