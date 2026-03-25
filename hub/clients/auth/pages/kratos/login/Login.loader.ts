import type { UseQueryReturnType } from "@tanstack/vue-query";
import type { Session } from "@ory/client";
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  useKratosSession,
  useLoginFlowQuery,
} from "@sderickson/recipes-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import { resolveLoginBrowserReturnTo } from "./Login.logic.ts";

/** Kratos `return_to` for the browser login flow (`?redirect=` or injected hub app fallback). Not part of `useLoginLoader` — loaders may only return TanStack queries for `AsyncPage`. */
export function useLoginBrowserReturnTo() {
  const route = useRoute();
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  return computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, postAuthFallbackHref.value),
  );
}

/** Used by `enabled` on the login flow query and by `Login.vue` guards (AsyncPage only accepts queries in the loader return object). */
export function loginFlowQueryEnabledForSession(
  sessionQuery: UseQueryReturnType<Session | null, Error>,
) {
  if (sessionQuery.isPending.value) return false;
  if (sessionQuery.data.value != null) return false;
  return true;
}

export function useLoginLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  /** Same resolution as {@link useLoginBrowserReturnTo} — duplicated here so `AsyncPage` loaders only return queries. */
  const browserReturnTo = computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, postAuthFallbackHref.value),
  );

  const sessionQuery = useKratosSession();

  const loginFlowEnabled = computed(() =>
    loginFlowQueryEnabledForSession(sessionQuery),
  );

  return {
    sessionQuery,
    loginFlowQuery: useLoginFlowQuery({
      flowId: flowId.value,
      returnTo: browserReturnTo.value,
      enabled: loginFlowEnabled,
    }),
  };
}
