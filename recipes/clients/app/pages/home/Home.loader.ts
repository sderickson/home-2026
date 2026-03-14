import { getProfile } from "@saflib/auth";
import { listCollectionsQuery } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";

export function useHomeLoader() {
  return {
    profileQuery: useQuery(getProfile()),
    collectionsQuery: useQuery(listCollectionsQuery()),
  };
}
