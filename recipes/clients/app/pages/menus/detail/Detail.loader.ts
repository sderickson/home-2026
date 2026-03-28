import {
  getCollectionsQuery,
  getMenuQuery,
  listRecipesQuery,
  membersListCollectionsQuery,
} from "@sderickson/recipes-sdk";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useDetailLoader() {
  const route = useRoute();
  const collectionId = route.params.collectionId as string;
  const id = route.params.id as string;

  return {
    sessionQuery: useKratosSession(),
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
    membersQuery: useQuery(membersListCollectionsQuery(collectionId)),
    menuQuery: useQuery(getMenuQuery(id, collectionId)),
    recipesQuery: useQuery(listRecipesQuery(collectionId)),
  };
}
