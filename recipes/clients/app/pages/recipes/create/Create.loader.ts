import {
  getCollectionsQuery,
  kratosSessionRequiredQueryOptions,
} from "@sderickson/recipes-sdk";
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
