import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  useCreateRegistrationFlowQuery,
  useKratosSession,
} from "@saflib/ory-kratos-sdk";
import { useGetRegistrationFlowQuery } from "@saflib/ory-kratos-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";

export function useRegistrationLoader() {
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

  const registrationFlowEnabled = computed(() => {
    if (sessionQuery.isPending.value) return false;
    if (sessionQuery.data.value != null) return false;
    return true;
  });

  return {
    sessionQuery,
    createRegistrationFlowQuery: useCreateRegistrationFlowQuery({
      returnTo: returnTo.value,
      enabled: computed(() => !flowId.value && registrationFlowEnabled.value),
    }),
    getRegistrationFlowQuery: useGetRegistrationFlowQuery({
      flowId: flowId.value,
      enabled: computed(() => !!flowId.value && registrationFlowEnabled.value),
    }),
  };
}
