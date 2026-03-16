import { computed } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { isDemoMode as getIsDemoMode, setDemoMode } from "./demo-mode.ts";
import { resetMocks } from "@sderickson/recipes-sdk/fakes";

export function useDemoMode() {
  const queryClient = useQueryClient();

  const isDemoMode = computed(() => getIsDemoMode());

  function enterDemoMode() {
    setDemoMode(true);
    window.location.reload();
  }

  function exitDemoMode() {
    setDemoMode(false);
    window.location.reload();
  }

  function resetDemoData() {
    resetMocks();
    queryClient.invalidateQueries();
  }

  return { isDemoMode, enterDemoMode, exitDemoMode, resetDemoData };
}
