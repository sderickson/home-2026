import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  useGetLoginFlowQuery,
  useCreateLoginFlowQuery,
  useKratosSession,
} from "@saflib/ory-kratos-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";

export function useLoginLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  const returnTo = computed(() =>
    typeof route.query.return_to === "string" && route.query.return_to.trim()
      ? route.query.return_to
      : postAuthFallbackHref.value,
  );

  const loginRefresh = computed(
    () => route.query.refresh === "true" || route.query.refresh === "1",
  );

  const sessionQuery = useKratosSession();

  const loginFlowEnabled = computed(() => {
    if (sessionQuery.isPending.value) return false;
    if (sessionQuery.data.value != null && !loginRefresh.value) return false;
    return true;
  });

  return {
    sessionQuery,
    createLoginFlowQuery: useCreateLoginFlowQuery({
      returnTo: returnTo.value,
      enabled: computed(() => !flowId.value && loginFlowEnabled.value),
    }),
    getLoginFlowQuery: useGetLoginFlowQuery({
      flowId: flowId.value,
      enabled: computed(() => !!flowId.value && loginFlowEnabled.value),
    }),
  };
}
