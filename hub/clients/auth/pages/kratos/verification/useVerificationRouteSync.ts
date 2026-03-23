import { useQueryClient } from "@tanstack/vue-query";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { linkToHrefWithHost, navigateToLink } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { verificationFlowQueryKey } from "@sderickson/recipes-sdk";
import {
  useVerificationBrowserReturnTo,
  useVerificationLoader,
} from "./Verification.loader.ts";
import { verificationFlowShouldFetch } from "./Verification.logic.ts";

/**
 * Route side effects and derived state for the verification page: session gate, `?flow=` URL sync,
 * and loader-driven flow id for the form.
 */
export function useVerificationRouteSync() {
  const route = useRoute();
  const router = useRouter();
  const queryClient = useQueryClient();
  const browserReturnTo = useVerificationBrowserReturnTo();
  const { sessionQuery, verificationFlowQuery } = useVerificationLoader();

  const verificationToken = computed(() =>
    typeof route.query.token === "string" ? route.query.token : undefined,
  );

  const shouldFetchVerificationFlow = computed(() =>
    verificationFlowShouldFetch(
      sessionQuery.isPending.value,
      sessionQuery.data.value,
      typeof route.query.flow === "string" ? route.query.flow : undefined,
    ),
  );

  const flowIdForForm = computed(() => {
    if (typeof route.query.flow === "string") return route.query.flow;
    return verificationFlowQuery.data.value?.id ?? "";
  });

  if (sessionQuery.status.value !== "success") {
    throw new Error("Failed to load session");
  }

  watch(
    () => [sessionQuery.status.value, sessionQuery.data.value, route.query.flow] as const,
    ([status, session, flowQ]) => {
      if (status !== "success") return;
      if (session != null) return;
      if (typeof flowQ === "string") return;
      navigateToLink(authLinks.kratosLogin, {
        params: {
          redirect: linkToHrefWithHost(authLinks.kratosVerification),
        },
      });
    },
    { immediate: true },
  );

  watch(
    () => ({
      status: verificationFlowQuery.status.value,
      data: verificationFlowQuery.data.value,
      flowParam: route.query.flow,
    }),
    ({ status, data, flowParam }) => {
      if (status !== "success" || !data?.id) return;
      if (typeof flowParam === "string") return;
      queryClient.setQueryData(
        verificationFlowQueryKey(data.id, browserReturnTo.value),
        data,
      );
      router.replace({
        path: route.path,
        query: { ...route.query, flow: data.id },
      });
    },
    { immediate: true },
  );

  if (
    shouldFetchVerificationFlow.value &&
    (verificationFlowQuery.status.value !== "success" ||
      !verificationFlowQuery.data.value?.id)
  ) {
    throw new Error("Failed to load verification flow");
  }

  return {
    sessionQuery,
    verificationFlowQuery,
    browserReturnTo,
    flowIdForForm,
    verificationToken,
  };
}
