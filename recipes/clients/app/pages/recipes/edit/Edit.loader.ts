import { getCollectionsQuery } from "@sderickson/recipes-sdk/requests/collections/get";
import { getRecipeQuery } from "@sderickson/recipes-sdk/requests/recipes/get";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useEditLoader() {
  const route = useRoute();
  const id = route.params.id as string;
  const collectionId = route.params.collectionId as string;

  return {
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
    recipeQuery: useQuery(getRecipeQuery(id)),
  };
}
