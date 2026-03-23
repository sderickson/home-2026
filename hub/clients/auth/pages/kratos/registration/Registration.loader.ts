import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  registrationFlowQueryOptions,
  useKratosSession,
} from "@sderickson/recipes-sdk";

export function useRegistrationLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  /** Full URL for Kratos `return_to` (from `?redirect=`, same convention as legacy auth links). */
  const redirectTo = computed(() =>
    typeof route.query.redirect === "string" ? route.query.redirect : undefined,
  );

  return {
    sessionQuery: useKratosSession(),
    registrationFlowQuery: useQuery(
      computed(() => registrationFlowQueryOptions(flowId.value, redirectTo.value)),
    ),
  };
}
