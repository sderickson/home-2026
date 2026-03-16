import { ref, onMounted } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { isDemoMode as getIsDemoMode, setDemoMode } from "../demo-mode.ts";

export function useDemoMode() {
  const queryClient = useQueryClient();
  const isDemoMode = ref(false);

  onMounted(() => {
    isDemoMode.value = getIsDemoMode();
  });

  function enterDemoMode() {
    setDemoMode(true);
    window.location.reload();
  }

  function exitDemoMode() {
    setDemoMode(false);
    window.location.reload();
  }

  async function resetDemoData() {
    const { resetMocks } = await import("@sderickson/recipes-sdk/fakes");
    resetMocks();
    queryClient.invalidateQueries();
  }

  return { isDemoMode, enterDemoMode, exitDemoMode, resetDemoData };
}
