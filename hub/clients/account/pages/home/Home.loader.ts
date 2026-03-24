import { kratosSessionRequiredQueryOptions } from "@sderickson/recipes-sdk";
import { useQuery } from "@tanstack/vue-query";

export function useHomeLoader() {
  return {
    sessionQuery: useQuery(kratosSessionRequiredQueryOptions()),
  };
}
