import type { UseQueryReturnType } from "@tanstack/vue-query";
import type { Session } from "@ory/client";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost, navigateToLink } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import { identityNeedsEmailVerification } from "@sderickson/recipes-sdk";
import {
  resolveVerifyWallRedirectDestination,
  sessionDisplayEmail,
} from "./VerifyWall.logic.ts";

/**
 * Route side effects and derived state for the verify wall: redirect unauthenticated users to
 * login, send verified users to `redirect` (or injected hub app fallback), and expose the verification CTA.
 */
export function useVerifyWallPage(
  sessionQuery: UseQueryReturnType<Session | null, Error>,
) {
  const route = useRoute();
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();

  const redirectAfter = computed(() =>
    resolveVerifyWallRedirectDestination(route.query.redirect, postAuthFallbackHref.value),
  );

  const verifyWallReturnHref = computed(() => {
    const r = route.query.redirect;
    if (typeof r === "string" && r.trim()) {
      return linkToHrefWithHost(authLinks.kratosVerifyWall, { params: { redirect: r.trim() } });
    }
    return linkToHrefWithHost(authLinks.kratosVerifyWall);
  });

  const verificationHref = computed(() =>
    linkToHrefWithHost(authLinks.kratosVerification, {
      params: { redirect: redirectAfter.value },
    }),
  );

  watch(
    () => sessionQuery.data.value,
    (session) => {
      if (sessionQuery.status.value !== "success") return;
      if (session == null) {
        navigateToLink(authLinks.kratosLogin, {
          params: { redirect: verifyWallReturnHref.value },
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => sessionQuery.data.value,
    (session) => {
      if (sessionQuery.status.value !== "success") return;
      if (session && !identityNeedsEmailVerification(session.identity)) {
        window.location.assign(redirectAfter.value);
      }
    },
    { immediate: true },
  );

  const showWall = computed(() => {
    const session = sessionQuery.data.value;
    if (!session) return false;
    return identityNeedsEmailVerification(session.identity);
  });

  const identityEmail = computed(() => {
    const session = sessionQuery.data.value;
    if (!session) return "";
    return sessionDisplayEmail(session);
  });

  return {
    showWall,
    identityEmail,
    verificationHref,
  };
}
