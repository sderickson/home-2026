import { ref, toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { fetchBrowserLogoutFlow } from "@sderickson/recipes-sdk";

export function useKratosBrowserLogout(options?: {
  /**
   * Kratos `return_to` after logout. When omitted, uses `?redirect=` from the current route if set,
   * otherwise the auth SPA home (legacy behavior for verify wall and similar).
   */
  afterLogoutReturnTo?: MaybeRefOrGetter<string>;
}) {
  const route = useRoute();
  const pending = ref(false);

  function resolveReturnTo(): string {
    if (options?.afterLogoutReturnTo !== undefined) {
      return toValue(options.afterLogoutReturnTo);
    }
    const q = route.query.redirect;
    return typeof q === "string" && q.trim() ? q.trim() : linkToHrefWithHost(authLinks.home);
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
