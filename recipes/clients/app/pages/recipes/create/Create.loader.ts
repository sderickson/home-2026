import { getProfile } from "@saflib/auth";
import { getCollectionsQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useCreateLoader() {
  const route = useRoute();
  const collectionId = route.params.collectionId as string;

  return {
    profileQuery: useQuery(getProfile()),
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
  };
}
