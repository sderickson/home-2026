import { listRecipesQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";

/** Root (public) list: uses a single collection id for public listing; product may configure. */
const ROOT_RECIPES_COLLECTION_ID = "public";

export function useListLoader() {
  return {
    recipesQuery: useQuery(listRecipesQuery(ROOT_RECIPES_COLLECTION_ID)),
  };
}
