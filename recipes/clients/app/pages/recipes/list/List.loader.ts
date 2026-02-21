import { getProfile } from "@saflib/auth";
import { listRecipesQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";

export function useListLoader() {
  return {
    profileQuery: useQuery(getProfile()),
    recipesQuery: useQuery(listRecipesQuery()),
  };
}
