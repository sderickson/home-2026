import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost, navigateToLink } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import {
  useVerificationBrowserReturnTo,
  useVerificationLoader,
} from "./Verification.loader.ts";
import { verificationFlowShouldFetch } from "./Verification.logic.ts";

/**
 * Route side effects and derived state for the verification page: session gate and `?flow=` for the form.
 */
export function useVerificationRouteSync() {
  const route = useRoute();
  const browserReturnTo = useVerificationBrowserReturnTo();
  const { sessionQuery, verificationFlowQuery } = useVerificationLoader();

  const verificationToken = computed(() =>
    typeof route.query.token === "string" ? route.query.token : undefined,
  );

  const flowIdForForm = computed(() => {
    if (typeof route.query.flow === "string") return route.query.flow;
    return "";
  });

  const shouldFetchVerificationFlow = computed(() =>
    verificationFlowShouldFetch(
      typeof route.query.flow === "string" ? route.query.flow : undefined,
    ),
  );

  if (sessionQuery.status.value !== "success") {
    throw new Error("Failed to load session");
  }

  watch(
    () => [sessionQuery.status.value, sessionQuery.data.value, route.query.flow] as const,
    ([status, session, flowQ]) => {
      if (status !== "success") return;
      if (session != null) return;
      if (typeof flowQ === "string") return;
      navigateToLink(authLinks.kratosLogin, {
        params: {
          redirect: linkToHrefWithHost(authLinks.kratosVerification),
        },
      });
    },
    { immediate: true },
  );

  if (
    shouldFetchVerificationFlow.value &&
    (verificationFlowQuery.status.value !== "success" ||
      !verificationFlowQuery.data.value?.id)
  ) {
    throw new Error("Failed to load verification flow");
  }

  return {
    sessionQuery,
    verificationFlowQuery,
    browserReturnTo,
    flowIdForForm,
    verificationToken,
  };
}
