import { computed } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";

/** Full URLs for cross-links between auth flows, preserving `?redirect=` when present. */
export function useAuthFlowCrossLinks() {
  const route = useRoute();
  const redirectOptions = computed(() => {
    const r = route.query.redirect;
    return typeof r === "string" && r.trim()
      ? ({ params: { redirect: r.trim() } } as const)
      : undefined;
  });
  const loginHref = computed(() =>
    linkToHrefWithHost(authLinks.kratosLogin, redirectOptions.value),
  );
  const registerHref = computed(() =>
    linkToHrefWithHost(authLinks.kratosRegistration, redirectOptions.value),
  );
  const recoveryHref = computed(() =>
    linkToHrefWithHost(authLinks.kratosRecovery, redirectOptions.value),
  );
  return { loginHref, registerHref, recoveryHref };
}
