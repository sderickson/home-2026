import { kratosSessionRequiredQueryOptions } from "@saflib/ory-kratos-sdk";
import { useQuery } from "@tanstack/vue-query";

export function useHomeLoader() {
  return {
    sessionQuery: useQuery(kratosSessionRequiredQueryOptions()),
  };
}
