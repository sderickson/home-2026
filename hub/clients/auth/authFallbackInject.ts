import { computed, inject, type ComputedRef, type InjectionKey } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks, rootLinks } from "@sderickson/hub-links";

const defaultPostAuthFallbackHref = computed(() => linkToHrefWithHost(appLinks.home));
const defaultRootHomeFallbackHref = computed(() => linkToHrefWithHost(rootLinks.home));

/**
 * Full URL for the hub **app** home (`app.`…`/`), used when `?redirect=` is absent: Kratos
 * `return_to`, post-login / post-verification navigation, verify-wall fallback, etc.
 * {@link AuthSpa.vue} provides this; composables fall back to the same hub-links resolution if missing.
 */
export const AUTH_POST_AUTH_FALLBACK_HREF: InjectionKey<ComputedRef<string>> = Symbol(
  "authPostAuthFallbackHref",
);

/**
 * Full URL for the hub **root** home (`/` on the root domain), used when logging out without
 * `?redirect=` so the browser lands on the logged-out marketing site.
 */
export const AUTH_ROOT_HOME_FALLBACK_HREF: InjectionKey<ComputedRef<string>> = Symbol(
  "authRootHomeFallbackHref",
);

export function useAuthPostAuthFallbackHref(): ComputedRef<string> {
  return inject(AUTH_POST_AUTH_FALLBACK_HREF, defaultPostAuthFallbackHref);
}

export function useAuthLoggedOutRootFallbackHref(): ComputedRef<string> {
  return inject(AUTH_ROOT_HOME_FALLBACK_HREF, defaultRootHomeFallbackHref);
}
