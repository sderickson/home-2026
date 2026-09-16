<script setup lang="ts">
import { computed, provide } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks, rootLinks } from "@sderickson/hub-links";
import { HubLayout } from "@sderickson/hub-clients-common";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import {
  AUTH_ROOT_HOME_FALLBACK_HREF,
  configureAuthApp,
} from "@saflib/ory-kratos-spa";

configureAuthApp({
  requireMfaAfterLogin: false,
  postAuthFallbackHref: computed(() => linkToHrefWithHost(appLinks.home)),
  postRegisterFallbackHref: computed(() => linkToHrefWithHost(appLinks.home)),
});

const rootHomeFallbackHref = computed(() => linkToHrefWithHost(rootLinks.home));
provide(AUTH_ROOT_HOME_FALLBACK_HREF, rootHomeFallbackHref);

const sessionQuery = useKratosSession();
const loggedIn = computed(() => !!sessionQuery.data.value?.identity);
</script>

<template>
  <HubLayout
    :logged-in="loggedIn"
    content-width="narrow"
  >
    <div class="auth-spa-container py-8 py-md-12">
      <router-view />
    </div>
  </HubLayout>
</template>

<style scoped>
.auth-spa-container {
  min-height: calc(100vh - 90px);
}
</style>
