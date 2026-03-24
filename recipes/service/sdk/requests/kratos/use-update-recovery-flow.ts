import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { FrontendApiUpdateRecoveryFlowRequest, RecoveryFlow } from "@ory/client";
import { getKratosFrontendApi } from "./kratos-client.ts";
import { invalidateKratosSessionQueries } from "./kratos-session.ts";

/** Kratos may return an updated recovery flow (validation errors) in the Axios response body (e.g. HTTP 400). */
export function extractRecoveryFlowFromError(e: unknown): RecoveryFlow | undefined {
  if (!isAxiosError(e)) return undefined;
  const d = e.response?.data;
  if (d && typeof d === "object" && "ui" in d && "id" in d) {
    return d as RecoveryFlow;
  }
  return undefined;
}

export const useUpdateRecoveryFlowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: FrontendApiUpdateRecoveryFlowRequest) => {
      const res = await getKratosFrontendApi().updateRecoveryFlow(vars);
      return res.data;
    },
    onSuccess: () => {
      void invalidateKratosSessionQueries(queryClient);
    },
  });
};
