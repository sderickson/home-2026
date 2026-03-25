import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  useKratosSession,
  useRecoveryFlowQuery,
} from "@sderickson/recipes-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import { resolveLoginBrowserReturnTo } from "../login/Login.logic.ts";
import { recoveryFlowShouldFetch } from "./Recovery.logic.ts";

/** Kratos `return_to` for the browser recovery flow (`?redirect=` or injected hub app fallback). Not part of `useRecoveryLoader` return shape — loaders may only return TanStack queries for `AsyncPage`. */
export function useRecoveryBrowserReturnTo() {
  const route = useRoute();
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  return computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, postAuthFallbackHref.value),
  );
}

export function useRecoveryLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  const browserReturnTo = computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, postAuthFallbackHref.value),
  );

  const sessionQuery = useKratosSession();

  const recoveryFlowEnabled = computed(() =>
    recoveryFlowShouldFetch(
      sessionQuery.isPending.value,
      sessionQuery.data.value,
      typeof route.query.flow === "string" ? route.query.flow : undefined,
    ),
  );

  return {
    sessionQuery,
    recoveryFlowQuery: useRecoveryFlowQuery({
      flowId: flowId.value,
      returnTo: browserReturnTo.value,
      enabled: recoveryFlowEnabled,
    }),
  };
}
