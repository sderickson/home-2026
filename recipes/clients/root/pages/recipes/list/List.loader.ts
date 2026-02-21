import { listRecipesQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";

export function useListLoader() {
  return {
    recipesQuery: useQuery(listRecipesQuery()),
  };
}
