import { sharedGetRecipesQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useRecipesLoader() {
  const route = useRoute();
  const recipeId = route.params.id as string;

  return {
    sharedRecipeQuery: useQuery(sharedGetRecipesQuery(recipeId)),
  };
}
