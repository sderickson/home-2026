import {
  getCollectionsQuery,
  listMenusQuery,
} from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";

export function useListLoader() {
  const route = useRoute();
  const collectionId = route.params.collectionId as string;

  return {
    collectionQuery: useQuery(getCollectionsQuery(collectionId)),
    menusQuery: useQuery(listMenusQuery(collectionId)),
  };
}
