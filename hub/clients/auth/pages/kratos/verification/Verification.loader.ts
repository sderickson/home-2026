import type { VerificationFlow } from "@ory/client";
import { useQuery } from "@tanstack/vue-query";
import { TanstackError } from "@saflib/sdk";
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  fetchVerificationFlowById,
  kratosFlowQueryRetry,
  useKratosSession,
  verificationFlowQueryKey,
} from "@sderickson/recipes-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import { resolveLoginBrowserReturnTo } from "../login/Login.logic.ts";
import { verificationFlowShouldFetch } from "./Verification.logic.ts";

/** Kratos `return_to` for the browser verification flow (`?redirect=` or injected hub app fallback). Not part of `useVerificationLoader` return shape — loaders may only return TanStack queries for `AsyncPage`. */
export function useVerificationBrowserReturnTo() {
  const route = useRoute();
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  return computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, postAuthFallbackHref.value),
  );
}

export function useVerificationLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  const browserReturnTo = computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, postAuthFallbackHref.value),
  );

  const sessionQuery = useKratosSession();

  const verificationFlowEnabled = computed(() =>
    verificationFlowShouldFetch(
      typeof route.query.flow === "string" ? route.query.flow : undefined,
    ),
  );

  const verificationFlowQuery = useQuery<VerificationFlow, TanstackError>(
    computed(() => ({
      queryKey: verificationFlowQueryKey(flowId.value, browserReturnTo.value) as readonly [
        "kratos",
        "verification",
        string,
      ],
      queryFn: () => fetchVerificationFlowById(flowId.value!),
      staleTime: 30_000,
      retry: kratosFlowQueryRetry,
      enabled: verificationFlowEnabled.value,
    })),
  );

  return {
    sessionQuery,
    verificationFlowQuery,
  };
}
