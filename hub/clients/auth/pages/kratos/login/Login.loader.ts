import type { UseQueryReturnType } from "@tanstack/vue-query";
import type { Session } from "@ory/client";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
  loginFlowQueryOptions,
  useKratosSession,
} from "@sderickson/recipes-sdk";
import { resolveLoginBrowserReturnTo } from "./Login.logic.ts";

/** Kratos `return_to` for the browser login flow (`?redirect=` or recipes home). Not part of `useLoginLoader` — loaders may only return TanStack queries for `AsyncPage`. */
export function useLoginBrowserReturnTo() {
  const route = useRoute();
  return computed(() =>
    resolveLoginBrowserReturnTo(
      route.query.redirect,
      linkToHrefWithHost(appLinks.home),
    ),
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
  /** Same resolution as {@link useLoginBrowserReturnTo} — duplicated here so `AsyncPage` loaders only return queries. */
  const browserReturnTo = computed(() =>
    resolveLoginBrowserReturnTo(
      route.query.redirect,
      linkToHrefWithHost(appLinks.home),
    ),
  );

  const sessionQuery = useKratosSession();

  const loginFlowEnabled = computed(() =>
    loginFlowQueryEnabledForSession(sessionQuery),
  );

  return {
    sessionQuery,
    loginFlowQuery: useQuery(
      computed(() => ({
        ...loginFlowQueryOptions(flowId.value, browserReturnTo.value),
        enabled: loginFlowEnabled.value,
      })),
    ),
  };
}
