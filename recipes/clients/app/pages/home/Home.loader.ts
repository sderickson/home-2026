import { listCollectionsQuery } from "@sderickson/recipes-sdk";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import { useQuery } from "@tanstack/vue-query";

export function useHomeLoader() {
  return {
    sessionQuery: useKratosSession(),
    collectionsQuery: useQuery(listCollectionsQuery()),
  };
}
