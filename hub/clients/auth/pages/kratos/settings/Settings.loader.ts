import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  useKratosSession,
  useSettingsFlowQuery,
} from "@sderickson/recipes-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import { resolveLoginBrowserReturnTo } from "../login/Login.logic.ts";
import { settingsFlowShouldFetch } from "./Settings.logic.ts";

/** Kratos `return_to` for the browser settings flow (`?redirect=` or injected hub app fallback). */
export function useSettingsBrowserReturnTo() {
  const route = useRoute();
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  return computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, postAuthFallbackHref.value),
  );
}

export function useSettingsLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  const browserReturnTo = computed(() =>
    resolveLoginBrowserReturnTo(route.query.redirect, postAuthFallbackHref.value),
  );

  const sessionQuery = useKratosSession();

  const settingsFlowEnabled = computed(() =>
    settingsFlowShouldFetch(sessionQuery.isPending.value, sessionQuery.data.value),
  );

  return {
    sessionQuery,
    settingsFlowQuery: useSettingsFlowQuery({
      flowId: flowId.value,
      returnTo: browserReturnTo.value,
      enabled: settingsFlowEnabled,
    }),
  };
}
