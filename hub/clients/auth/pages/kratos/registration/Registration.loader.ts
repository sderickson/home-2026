import type { UseQueryReturnType } from "@tanstack/vue-query";
import type { Session } from "@ory/client";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
  useKratosSession,
  useRegistrationFlowQuery,
} from "@sderickson/recipes-sdk";
import { resolveLoginBrowserReturnTo } from "../login/Login.logic.ts";

/** Used by `enabled` on the registration flow query and by `Registration.vue` guards (AsyncPage only accepts queries in the loader return object). */
export function registrationFlowQueryEnabledForSession(
  sessionQuery: UseQueryReturnType<Session | null, Error>,
) {
  if (sessionQuery.isPending.value) return false;
  if (sessionQuery.data.value != null) return false;
  return true;
}

export function useRegistrationLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  /** Resolved `return_to` for the registration browser flow (matches login). */
  const browserReturnTo = computed(() =>
    resolveLoginBrowserReturnTo(
      route.query.redirect,
      linkToHrefWithHost(appLinks.home),
    ),
  );

  const sessionQuery = useKratosSession();

  const registrationFlowEnabled = computed(() =>
    registrationFlowQueryEnabledForSession(sessionQuery),
  );

  return {
    sessionQuery,
    registrationFlowQuery: useRegistrationFlowQuery({
      flowId: flowId.value,
      returnTo: browserReturnTo.value,
      enabled: registrationFlowEnabled,
    }),
  };
}

/** Same resolution as login: `?redirect=` or recipes app home URL. */
export function useRegistrationBrowserReturnTo() {
  const route = useRoute();
  return computed(() =>
    resolveLoginBrowserReturnTo(
      route.query.redirect,
      linkToHrefWithHost(appLinks.home),
    ),
  );
}
