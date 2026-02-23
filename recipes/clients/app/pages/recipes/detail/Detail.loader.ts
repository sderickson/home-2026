import {
  getRecipeQuery,
  listRecipeVersionsQuery,
  notesListRecipesQuery,
} from "@sderickson/recipes-sdk";
import { getProfile } from "@saflib/auth";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useDetailLoader() {
  const route = useRoute();
  const id = route.params.id as string;

  return {
    profileQuery: useQuery(getProfile()),
    recipeQuery: useQuery(getRecipeQuery(id)),
    versionsQuery: useQuery(listRecipeVersionsQuery(id)),
    notesQuery: useQuery(notesListRecipesQuery(id)),
  };
}
