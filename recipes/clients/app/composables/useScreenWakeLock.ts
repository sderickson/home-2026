import { onMounted, onUnmounted } from "vue";

/**
 * Requests a screen wake lock while the calling component is mounted so the
 * display stays on (e.g. cooking from a recipe). Re-acquires when the tab
 * becomes visible again; no-ops if the API is missing or permission denied.
 */
export function useScreenWakeLock() {
  let sentinel: WakeLockSentinel | null = null;

  async function release() {
    if (!sentinel) return;
    try {
      await sentinel.release();
    } catch {
      // already released
    }
    sentinel = null;
  }

  async function acquire() {
    if (!("wakeLock" in navigator)) return;
    if (document.visibilityState !== "visible") return;
    try {
      await release();
      sentinel = await navigator.wakeLock.request("screen");
      sentinel.addEventListener("release", () => {
        sentinel = null;
      });
    } catch {
      sentinel = null;
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === "visible") {
      void acquire();
    }
  }

  onMounted(() => {
    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    void release();
  });
}
