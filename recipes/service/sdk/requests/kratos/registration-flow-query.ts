import { queryOptions, useQuery } from "@tanstack/vue-query";
import type { RegistrationFlow } from "@ory/client";
import {
  fetchBrowserRegistrationFlow,
  fetchRegistrationFlowById,
} from "./kratos-flows.ts";

const registrationRootKey = ["kratos", "registration"] as const;

/** Stable key: includes flow id when loading an existing flow from the URL; otherwise `"browser"` for a fresh flow. */
export function registrationFlowQueryKey(flowId?: string) {
  if (flowId) {
    return [...registrationRootKey, flowId] as const;
  }
  return [...registrationRootKey, "browser"] as const;
}

/** Cached registration flow from `fetchBrowserRegistrationFlow` or `fetchRegistrationFlowById`. */
export function registrationFlowQueryOptions(flowId?: string) {
  return queryOptions({
    queryKey: registrationFlowQueryKey(flowId),
    queryFn: async (): Promise<RegistrationFlow> =>
      flowId ? fetchRegistrationFlowById(flowId) : fetchBrowserRegistrationFlow(),
    staleTime: 30_000,
  });
}

export function useRegistrationFlowQuery(flowId?: string) {
  return useQuery(registrationFlowQueryOptions(flowId));
}
