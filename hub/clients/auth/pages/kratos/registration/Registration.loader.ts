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

  return {
    sessionQuery: useKratosSession(),
    registrationFlowQuery: useQuery(
      computed(() => registrationFlowQueryOptions(flowId.value)),
    ),
  };
}
