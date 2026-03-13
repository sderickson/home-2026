import { listPublicRecipesQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";

/** Root (public) list: all public recipes across all collections (GET /recipes?publicOnly=true). */
export function useListLoader() {
  return {
    recipesQuery: useQuery(listPublicRecipesQuery()),
  };
}
