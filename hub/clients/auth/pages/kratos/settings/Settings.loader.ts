import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  useKratosSession,
  useGetSettingsFlowQuery,
  useCreateSettingsFlowQuery,
} from "@saflib/ory-kratos-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";

export function useSettingsLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  const returnTo = computed(() =>
    typeof route.query.return_to === "string"
      ? route.query.return_to
      : postAuthFallbackHref.value,
  );

  const sessionQuery = useKratosSession();

  return {
    sessionQuery,
    createSettingsFlowQuery: useCreateSettingsFlowQuery({
      returnTo: returnTo.value,
      enabled: computed(() => !flowId.value),
    }),
    getSettingsFlowQuery: useGetSettingsFlowQuery({
      flowId: flowId.value,
      enabled: computed(() => !!flowId.value),
    }),
  };
}
