import type { UseQueryReturnType } from "@tanstack/vue-query";
import type { RegistrationFlow, Session } from "@ory/client";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { TanstackError } from "@saflib/sdk";
import {
  registrationFlowQueryOptions,
  useKratosSession,
} from "@sderickson/recipes-sdk";

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
  /** Full URL for Kratos `return_to` (from `?redirect=`, same convention as legacy auth links). */
  const redirectTo = computed(() =>
    typeof route.query.redirect === "string" ? route.query.redirect : undefined,
  );

  const sessionQuery = useKratosSession();

  const registrationFlowEnabled = computed(() =>
    registrationFlowQueryEnabledForSession(sessionQuery),
  );

  return {
    sessionQuery,
    registrationFlowQuery: useQuery(
      computed(() => ({
        ...registrationFlowQueryOptions(flowId.value, redirectTo.value),
        enabled: registrationFlowEnabled.value,
      })),
    ) as UseQueryReturnType<RegistrationFlow, TanstackError>,
  };
}
