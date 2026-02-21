import { getRecipeQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useEditLoader() {
  const route = useRoute();
  const id = route.params.id as string;

  return {
    recipeQuery: useQuery(getRecipeQuery(id)),
  };
}
