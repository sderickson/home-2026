import type { UseQueryReturnType } from "@tanstack/vue-query";
import type { VerificationFlow } from "@ory/client";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { TanstackError } from "@saflib/sdk";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
  verificationFlowQueryOptions,
  useKratosSession,
} from "@sderickson/recipes-sdk";
import { resolveLoginBrowserReturnTo } from "../login/Login.logic.ts";
import { verificationFlowShouldFetch } from "./Verification.logic.ts";

/** Kratos `return_to` for the browser verification flow (`?redirect=` or recipes home). Not part of `useVerificationLoader` return shape — loaders may only return TanStack queries for `AsyncPage`. */
export function useVerificationBrowserReturnTo() {
  const route = useRoute();
  return computed(() =>
    resolveLoginBrowserReturnTo(
      route.query.redirect,
      linkToHrefWithHost(appLinks.home),
    ),
  );
}

export function useVerificationLoader() {
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

  const verificationFlowEnabled = computed(() =>
    verificationFlowShouldFetch(
      sessionQuery.isPending.value,
      sessionQuery.data.value,
      typeof route.query.flow === "string" ? route.query.flow : undefined,
    ),
  );

  return {
    sessionQuery,
    verificationFlowQuery: useQuery(
      computed(() => ({
        ...verificationFlowQueryOptions(flowId.value, browserReturnTo.value),
        enabled: verificationFlowEnabled.value,
      })),
    ) as UseQueryReturnType<VerificationFlow, TanstackError>,
  };
}
