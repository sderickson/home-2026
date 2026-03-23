import type { UseQueryReturnType } from "@tanstack/vue-query";
import type { Session } from "@ory/client";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { loginFlowQueryOptions, useKratosSession } from "@sderickson/recipes-sdk";
import { resolveLoginBrowserReturnTo } from "./Login.logic.ts";

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
  /** Full URL for Kratos `return_to` (from `?redirect=`), defaulting to the recipes app home. */
  const returnTo = computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, linkToHrefWithHost(appLinks.home)),
  );

  const sessionQuery = useKratosSession();

  const loginFlowEnabled = computed(() => loginFlowQueryEnabledForSession(sessionQuery));

  return {
    sessionQuery,
    loginFlowQuery: useQuery(
      computed(() => ({
        ...loginFlowQueryOptions(flowId.value, returnTo.value),
        enabled: loginFlowEnabled.value,
      })),
    ),
  };
}
