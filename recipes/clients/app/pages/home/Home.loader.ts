import {
  kratosSessionRequiredQueryOptions,
  listCollectionsQuery,
} from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";

export function useHomeLoader() {
  return {
    sessionQuery: useQuery(kratosSessionRequiredQueryOptions()),
    collectionsQuery: useQuery(listCollectionsQuery()),
  };
}
