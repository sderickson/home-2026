import { useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  fetchBrowserVerificationFlow,
  verificationFlowQueryKey,
} from "@saflib/ory-kratos-sdk";

/**
 * Creates a browser verification flow and sets `?flow=` so the code-entry UI loads for that flow.
 * Used for the initial "Send a code" action and for "Send a new code" on an active flow.
 */
export function useVerificationNewBrowserFlow() {
  const route = useRoute();
  const router = useRouter();
  const pending = ref(false);

  async function startNewBrowserFlow() {
    if (pending.value) return;
    pending.value = true;
    try {
      const flow = await fetchBrowserVerificationFlow();
      await router.replace({
        path: route.path,
        query: { ...route.query, flow: flow.id },
      });
    } finally {
      pending.value = false;
    }
  }

  return { startNewBrowserFlow, pending };
}
