<template>
  <div>
    <i18n-t
      scope="global"
      :keypath="lookupTKey(strings.logged_in_with_email)"
      tag="p"
      class="text-body-1 mb-4"
    >
      <template #email>{{ identityEmail }}</template>
    </i18n-t>
    <div class="d-flex flex-wrap ga-3">
      <v-btn
        color="primary"
        size="large"
        variant="tonal"
        tag="a"
        :href="continueHref"
        :aria-label="t(strings.continue_aria)"
      >
        {{ t(strings.continue) }}
      </v-btn>
      <v-btn
        size="large"
        variant="outlined"
        :loading="pending"
        :aria-label="
          t(
            variant === 'registration'
              ? strings.register_as_different_aria
              : strings.sign_in_as_different_aria,
          )
        "
        @click="startBrowserLogout"
      >
        {{
          t(
            variant === "registration"
              ? strings.register_as_different
              : strings.sign_in_as_different,
          )
        }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { auth_session_decision as strings } from "./AuthSessionDecisionPanel.strings.ts";
import { useKratosBrowserLogout } from "../registration/useKratosBrowserLogout.ts";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";

const props = defineProps<{
  identityEmail: string;
  variant: "login" | "registration";
}>();

const { t, lookupTKey } = useReverseT();
const route = useRoute();
const postAuthFallbackHref = useAuthPostAuthFallbackHref();

const continueHref = computed(() => {
  return typeof route.query.redirect === "string" && route.query.redirect.trim()
    ? route.query.redirect.trim()
    : postAuthFallbackHref.value;
});

const afterLogoutReturnTo = computed(() =>
  linkToHrefWithHost(
    props.variant === "registration"
      ? authLinks.kratosRegistration
      : authLinks.kratosLogin,
    typeof route.query.redirect === "string" && route.query.redirect.trim()
      ? { params: { redirect: route.query.redirect.trim() } }
      : undefined,
  ),
);

const { pending, startBrowserLogout } = useKratosBrowserLogout({
  afterLogoutReturnTo,
});
</script>
