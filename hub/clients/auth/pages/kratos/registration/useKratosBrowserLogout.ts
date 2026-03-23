import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { fetchBrowserLogoutFlow } from "@sderickson/recipes-sdk";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";

/**
 * Starts Kratos browser logout and navigates to `logout_url` (full browser navigation).
 * Uses `?redirect=` when present (same as registration / legacy auth) for Kratos `return_to`.
 */
export function useKratosBrowserLogout() {
  const route = useRoute();
  const pending = ref(false);

  const logoutReturnTo = computed(() => {
    const q = route.query.redirect;
    return typeof q === "string" && q.trim() ? q.trim() : undefined;
  });

  async function startBrowserLogout() {
    if (pending.value) return;
    pending.value = true;
    try {
      const returnTo = logoutReturnTo.value ?? linkToHrefWithHost(authLinks.home);
      const { logout_url } = await fetchBrowserLogoutFlow(returnTo);
      window.location.assign(logout_url);
    } finally {
      pending.value = false;
    }
  }

  return { pending, startBrowserLogout };
}
