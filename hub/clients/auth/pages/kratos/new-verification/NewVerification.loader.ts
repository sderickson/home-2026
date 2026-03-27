import { computed } from "vue";
import { useRoute } from "vue-router";
import { useCreateVerificationFlowQuery } from "@saflib/ory-kratos-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";

export function useNewVerificationLoader() {
  const route = useRoute();
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  const returnTo = computed(() => {
    if (typeof route.query.return_to === "string" && route.query.return_to.trim()) {
      return route.query.return_to.trim();
    }
    if (typeof route.query.redirect === "string" && route.query.redirect.trim()) {
      return route.query.redirect.trim();
    }
    return postAuthFallbackHref.value;
  });

  return {
    createVerificationFlowQuery: useCreateVerificationFlowQuery({
      returnTo: returnTo.value,
    }),
  };
}
