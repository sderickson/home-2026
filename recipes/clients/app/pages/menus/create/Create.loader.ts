import { getCollectionsQuery } from "@sderickson/recipes-sdk/requests/collections/get";
import { membersListCollectionsQuery } from "@sderickson/recipes-sdk/requests/collections/members-list";
import { listRecipesQuery } from "@sderickson/recipes-sdk/requests/recipes/list";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useCreateLoader() {
  const route = useRoute();
  const collectionId = route.params.collectionId as string;

  return {
    sessionQuery: useKratosSession(),
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
    membersQuery: useQuery(membersListCollectionsQuery(collectionId)),
    recipesQuery: useQuery(listRecipesQuery(collectionId)),
  };
}
