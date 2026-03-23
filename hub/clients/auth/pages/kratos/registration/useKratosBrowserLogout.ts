import { ref } from "vue";
import { fetchBrowserLogoutFlow } from "@sderickson/recipes-sdk";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/hub-links";

/**
 * Starts Kratos browser logout and navigates to `logout_url` (full browser navigation).
 */
export function useKratosBrowserLogout() {
  const pending = ref(false);

  async function startBrowserLogout() {
    if (pending.value) return;
    pending.value = true;
    try {
      const returnTo = linkToHrefWithHost(appLinks.home);
      const { logout_url } = await fetchBrowserLogoutFlow(returnTo);
      window.location.assign(logout_url);
    } finally {
      pending.value = false;
    }
  }

  return { pending, startBrowserLogout };
}
