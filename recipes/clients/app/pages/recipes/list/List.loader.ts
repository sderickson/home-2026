import { getProfile } from "@saflib/auth";
import { listRecipesQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useListLoader() {
  const route = useRoute();
  const collectionId = route.params.collectionId as string;

  return {
    profileQuery: useQuery(getProfile()),
    recipesQuery: useQuery(listRecipesQuery(collectionId)),
  };
}
