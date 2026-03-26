import { useQueryClient } from "@tanstack/vue-query";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { linkToHrefWithHost, navigateToLink } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { isKratosFlowGoneError, settingsFlowQueryKey } from "@sderickson/recipes-sdk";
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
  const settingsFlowAalReauthRedirect = computed(() => {
    const d = settingsFlowQuery.data.value;
    if (!d || typeof d !== "object") return undefined;
    if ("ui" in d) return undefined;
    if ("redirect_browser_to" in d && typeof d.redirect_browser_to === "string") {
      return d.redirect_browser_to;
    }
    return undefined;
  });
  const settingsFlowExpired = computed(() =>
    isKratosFlowGoneError(settingsFlowQuery.error.value),
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

  // Settings should recover automatically from expired/used flows by creating a fresh flow.
  watch(
    () => [settingsFlowExpired.value, route.query.flow, route.query.redirect] as const,
    ([expired, flowQ, redirectQ]) => {
      if (!expired) return;
      if (typeof flowQ !== "string") return;
      const nextQuery: Record<string, string> = {};
      if (typeof redirectQ === "string") {
        nextQuery.redirect = redirectQ;
      }
      void router.replace({
        path: route.path,
        query: nextQuery,
      });
    },
    { immediate: true },
  );

  watch(
    () => settingsFlowAalReauthRedirect.value,
    (redirectBrowserTo) => {
      if (!redirectBrowserTo) return;
      const loginUrl = new URL(linkToHrefWithHost(authLinks.kratosLogin), window.location.origin);
      try {
        const kratosRedirect = new URL(redirectBrowserTo);
        const refresh = kratosRedirect.searchParams.get("refresh");
        const returnTo = kratosRedirect.searchParams.get("return_to");
        if (refresh) loginUrl.searchParams.set("refresh", refresh);
        if (returnTo) loginUrl.searchParams.set("return_to", returnTo);
      } catch {
        // Fallback to plain login link when redirect payload is malformed.
      }
      window.location.assign(loginUrl.toString());
    },
    { immediate: true },
  );

  if (
    shouldFetchSettingsFlow.value &&
    !settingsFlowAalReauthRedirect.value &&
    !settingsFlowExpired.value &&
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
