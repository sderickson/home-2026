import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  // useCreateVerificationFlowQuery,
  useGetVerificationFlowQuery,
  useKratosSession,
} from "@saflib/ory-kratos-sdk";
// import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";

export function useVerificationLoader() {
  const route = useRoute();
  const flowId = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  // const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  // const returnTo = computed(() =>
  //   typeof route.query.return_to === "string"
  //     ? route.query.return_to
  //     : postAuthFallbackHref.value,
  // );

  const sessionQuery = useKratosSession();

  return {
    sessionQuery,
    getVerificationFlowQuery: useGetVerificationFlowQuery({
      flowId: flowId.value,
      enabled: computed(() => !!flowId.value),
    }),
  };
}
