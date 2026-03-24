import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
  settingsFlowQueryOptions,
  useKratosSession,
} from "@sderickson/recipes-sdk";
import { resolveLoginBrowserReturnTo } from "../login/Login.logic.ts";
import { settingsFlowShouldFetch } from "./Settings.logic.ts";

/** Kratos `return_to` for the browser settings flow (`?redirect=` or recipes home). */
export function useSettingsBrowserReturnTo() {
  const route = useRoute();
  return computed(() =>
    resolveLoginBrowserReturnTo(
      route.query.redirect,
      linkToHrefWithHost(appLinks.home),
    ),
  );
}

export function useSettingsLoader() {
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

  const settingsFlowEnabled = computed(() =>
    settingsFlowShouldFetch(sessionQuery.isPending.value, sessionQuery.data.value),
  );

  return {
    sessionQuery,
    settingsFlowQuery: useQuery(
      computed(() => ({
        ...settingsFlowQueryOptions(flowId.value, browserReturnTo.value),
        enabled: settingsFlowEnabled.value,
      })),
    ),
  };
}
