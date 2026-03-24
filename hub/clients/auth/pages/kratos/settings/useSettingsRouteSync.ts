import { useQueryClient } from "@tanstack/vue-query";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { linkToHrefWithHost, navigateToLink } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { settingsFlowQueryKey } from "@sderickson/recipes-sdk";
import {
  useSettingsBrowserReturnTo,
  useSettingsLoader,
} from "./Settings.loader.ts";
import { settingsFlowShouldFetch } from "./Settings.logic.ts";

/**
 * Session gate, `?flow=` URL sync after browser-initiated settings flow, and loader-driven flow id.
 */
export function useSettingsRouteSync() {
  const route = useRoute();
  const router = useRouter();
  const queryClient = useQueryClient();
  const browserReturnTo = useSettingsBrowserReturnTo();
  const { sessionQuery, settingsFlowQuery } = useSettingsLoader();

  const shouldFetchSettingsFlow = computed(() =>
    settingsFlowShouldFetch(
      sessionQuery.isPending.value,
      sessionQuery.data.value,
    ),
  );

  const flowIdForForm = computed(() => {
    if (typeof route.query.flow === "string") return route.query.flow;
    return settingsFlowQuery.data.value?.id ?? "";
  });

  if (sessionQuery.status.value !== "success") {
    throw new Error("Failed to load session");
  }

  watch(
    () => [sessionQuery.status.value, sessionQuery.data.value] as const,
    ([status, session]) => {
      if (status !== "success") return;
      if (session != null) return;
      navigateToLink(authLinks.kratosLogin, {
        params: {
          redirect: linkToHrefWithHost(authLinks.kratosSettings),
        },
      });
    },
    { immediate: true },
  );

  watch(
    () => ({
      status: settingsFlowQuery.status.value,
      data: settingsFlowQuery.data.value,
      flowParam: route.query.flow,
    }),
    ({ status, data, flowParam }) => {
      if (status !== "success" || !data?.id) return;
      if (typeof flowParam === "string") return;
      queryClient.setQueryData(
        settingsFlowQueryKey(data.id, browserReturnTo.value),
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
    shouldFetchSettingsFlow.value &&
    (settingsFlowQuery.status.value !== "success" ||
      !settingsFlowQuery.data.value?.id)
  ) {
    throw new Error("Failed to load settings flow");
  }

  return {
    sessionQuery,
    settingsFlowQuery,
    browserReturnTo,
    flowIdForForm,
  };
}
