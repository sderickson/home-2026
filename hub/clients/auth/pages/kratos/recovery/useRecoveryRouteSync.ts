import { computed } from "vue";
import { useRoute } from "vue-router";
import { useRecoveryBrowserReturnTo } from "./Recovery.loader.ts";

/** Route query + derived Kratos `return_to` for the recovery page (flow UI vs browser `return_to`). */
export function useRecoveryRouteSync() {
  const route = useRoute();
  const browserReturnTo = useRecoveryBrowserReturnTo();
  const flowIdForForm = computed(() =>
    typeof route.query.flow === "string" ? route.query.flow : undefined,
  );
  const recoveryToken = computed(() =>
    typeof route.query.token === "string" ? route.query.token : undefined,
  );
  return { browserReturnTo, flowIdForForm, recoveryToken };
}
