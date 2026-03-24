import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
  recoveryFlowQueryOptions,
  useKratosSession,
} from "@sderickson/recipes-sdk";
import { resolveLoginBrowserReturnTo } from "../login/Login.logic.ts";
import { recoveryFlowShouldFetch } from "./Recovery.logic.ts";

/** Kratos `return_to` for the browser recovery flow (`?redirect=` or recipes home). Not part of `useRecoveryLoader` return shape — loaders may only return TanStack queries for `AsyncPage`. */
export function useRecoveryBrowserReturnTo() {
  const route = useRoute();
  return computed(() =>
    resolveLoginBrowserReturnTo(
      route.query.redirect,
      linkToHrefWithHost(appLinks.home),
    ),
  );
}

export function useRecoveryLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  const browserReturnTo = computed(() =>
    resolveLoginBrowserReturnTo(
      route.query.redirect,
      linkToHrefWithHost(appLinks.home),
    ),
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
    recoveryFlowQuery: useQuery(
      computed(() => ({
        ...recoveryFlowQueryOptions(flowId.value, browserReturnTo.value),
        enabled: recoveryFlowEnabled.value,
      })),
    ),
  };
}
