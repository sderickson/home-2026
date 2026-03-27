import {
  computed,
  inject,
  ref,
  type Ref,
  type ComputedRef,
  type InjectionKey,
} from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks, rootLinks } from "@sderickson/hub-links";
import { useRoute } from "vue-router";

const defaultPostAuthFallbackHref = computed(() =>
  linkToHrefWithHost(appLinks.home),
);
const defaultRootHomeFallbackHref = computed(() =>
  linkToHrefWithHost(rootLinks.home),
);

/**
 * Full URL for the hub **app** home (`app.`…`/`), used when `?redirect=` is absent: Kratos
 * `return_to`, post-login / post-verification navigation, verify-wall fallback, etc.
 * {@link AuthSpa.vue} provides this; composables fall back to the same hub-links resolution if missing.
 */
export const AUTH_POST_AUTH_FALLBACK_HREF: InjectionKey<ComputedRef<string>> =
  Symbol("authPostAuthFallbackHref");

/**
 * Full URL for the hub **root** home (`/` on the root domain), used when logging out without
 * `?redirect=` so the browser lands on the logged-out marketing site.
 */
export const AUTH_ROOT_HOME_FALLBACK_HREF: InjectionKey<ComputedRef<string>> =
  Symbol("authRootHomeFallbackHref");

/**
 * Returns a url to return to after authentication, either from the `?redirect=` query parameter or the default post-auth fallback URL.
 */
export function useAuthPostAuthFallbackHref(): Ref<string> {
  const route = useRoute();
  const redirect = route.query.redirect;
  if (typeof redirect === "string") {
    return ref(redirect.trim());
  }
  return inject(AUTH_POST_AUTH_FALLBACK_HREF, defaultPostAuthFallbackHref);
}

/**
 * Returns a url to return to after logging out, either from the `?redirect=` query parameter or the default logged-out root home URL.
 */
export function useAuthLoggedOutRootFallbackHref(): Ref<string> {
  const route = useRoute();
  const redirect = route.query.redirect;
  if (typeof redirect === "string") {
    return ref(redirect.trim());
  }
  return inject(AUTH_ROOT_HOME_FALLBACK_HREF, defaultRootHomeFallbackHref);
}
