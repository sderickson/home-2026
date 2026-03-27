import { computed } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";

/** Full URL to `/new-verification`, preserving `redirect` / `return_to` from the current route. */
export function useNewVerificationEntryHref() {
  const route = useRoute();
  return computed(() => {
    const redirect =
      typeof route.query.redirect === "string" && route.query.redirect.trim()
        ? route.query.redirect.trim()
        : undefined;
    const returnTo =
      typeof route.query.return_to === "string" && route.query.return_to.trim()
        ? route.query.return_to.trim()
        : undefined;
    const opts =
      redirect || returnTo
        ? {
            params: {
              ...(redirect ? { redirect } : {}),
              ...(returnTo ? { return_to: returnTo } : {}),
            },
          }
        : undefined;
    return linkToHrefWithHost(authLinks.kratosNewVerification, opts);
  });
}
