import { ref, toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { fetchBrowserLogoutFlow } from "@saflib/ory-kratos-sdk";
import { useAuthLoggedOutRootFallbackHref } from "../../../authFallbackInject.ts";

export function useKratosBrowserLogout(options?: {
  /**
   * Kratos `return_to` after logout. When omitted, uses `?redirect=` from the current route if set,
   * otherwise the injected hub root home (logged-out landing).
   */
  afterLogoutReturnTo?: MaybeRefOrGetter<string>;
}) {
  const route = useRoute();
  const rootHomeFallbackHref = useAuthLoggedOutRootFallbackHref();
  const pending = ref(false);

  function resolveReturnTo(): string {
    if (options?.afterLogoutReturnTo !== undefined) {
      return toValue(options.afterLogoutReturnTo);
    }
    const q = route.query.redirect;
    return typeof q === "string" && q.trim()
      ? q.trim()
      : rootHomeFallbackHref.value;
  }

  async function startBrowserLogout() {
    if (pending.value) return;
    pending.value = true;
    try {
      const { logout_url } = await fetchBrowserLogoutFlow(resolveReturnTo());
      window.location.assign(logout_url);
    } finally {
      pending.value = false;
    }
  }

  return { pending, startBrowserLogout };
}
