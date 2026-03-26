import { useQueryClient } from "@tanstack/vue-query";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { navigateToLink } from "@saflib/links";
import { appLinks } from "@sderickson/hub-links";
import { recoveryFlowQueryKey } from "@sderickson/recipes-sdk";
import {
  useRecoveryBrowserReturnTo,
  useRecoveryLoader,
} from "./Recovery.loader.ts";
import { recoveryFlowShouldFetch } from "./Recovery.logic.ts";

/**
 * Route side effects and derived state for the recovery page: session gate, `?flow=` / `?token=`
 * handling, and loader-driven flow id for the form.
 */
export function useRecoveryRouteSync() {
  const route = useRoute();
  const router = useRouter();
  const queryClient = useQueryClient();
  const browserReturnTo = useRecoveryBrowserReturnTo();
  const { sessionQuery, recoveryFlowQuery } = useRecoveryLoader();

  const recoveryToken = computed(() =>
    typeof route.query.token === "string" ? route.query.token : undefined,
  );

  const shouldFetchRecoveryFlow = computed(() =>
    recoveryFlowShouldFetch(
      sessionQuery.isPending.value,
      sessionQuery.data.value,
      typeof route.query.flow === "string" ? route.query.flow : undefined,
    ),
  );

  const flowIdForForm = computed(() => {
    if (typeof route.query.flow === "string") return route.query.flow;
    return recoveryFlowQuery.data.value?.id ?? "";
  });

  if (sessionQuery.status.value !== "success") {
    throw new Error("Failed to load session");
  }

  watch(
    () => [sessionQuery.status.value, sessionQuery.data.value, route.query.flow] as const,
    ([status, session, flowQ]) => {
      if (status !== "success") return;
      if (session == null) return;
      if (typeof flowQ === "string") return;
      navigateToLink(appLinks.home);
    },
    { immediate: true },
  );

  watch(
    () => ({
      status: recoveryFlowQuery.status.value,
      data: recoveryFlowQuery.data.value,
      flowParam: route.query.flow,
    }),
    ({ status, data, flowParam }) => {
      if (status !== "success" || !data?.id) return;
      if (typeof flowParam === "string") return;
      queryClient.setQueryData(
        recoveryFlowQueryKey(data.id, browserReturnTo.value),
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
    shouldFetchRecoveryFlow.value &&
    (recoveryFlowQuery.status.value !== "success" || !recoveryFlowQuery.data.value?.id)
  ) {
    throw new Error("Failed to load recovery flow");
  }

  return {
    sessionQuery,
    recoveryFlowQuery,
    browserReturnTo,
    flowIdForForm,
    recoveryToken,
  };
}
