import { isAxiosError } from "axios";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { Session } from "@ory/client";
import { getKratosFrontendApi } from "./kratos-client.ts";

export const kratosSessionQueryKey = ["kratos", "session"] as const;

async function fetchKratosSession(): Promise<Session | null> {
  try {
    const res = await getKratosFrontendApi().toSession();
    return res.data;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 401) {
      return null;
    }
    throw e;
  }
}

/** FrontendApi `toSession` (browser cookies). 401 resolves to `null` (not authenticated). */
export const kratosSessionQueryOptions = () =>
  queryOptions({
    queryKey: kratosSessionQueryKey,
    queryFn: fetchKratosSession,
    staleTime: 30_000,
  });

/** Cached Kratos session. `data === null` means not authenticated (including 401). */
export function useKratosSession() {
  return useQuery(kratosSessionQueryOptions());
}

/** Invalidate after login, register, or logout so `useKratosSession` refetches. */
export function useInvalidateKratosSession() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: kratosSessionQueryKey });
}
