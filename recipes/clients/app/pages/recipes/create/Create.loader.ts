import { getCollectionsQuery } from "@sderickson/recipes-sdk";
import { kratosSessionRequiredQueryOptions } from "@saflib/ory-kratos-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useCreateLoader() {
  const route = useRoute();
  const collectionId = route.params.collectionId as string;

  return {
    sessionQuery: useQuery(kratosSessionRequiredQueryOptions()),
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
  };
}
