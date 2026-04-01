<script setup lang="ts">
import { computed, provide } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks, rootLinks } from "@sderickson/hub-links";
import { HubLayout } from "@sderickson/hub-clients-common";
import { useKratosSession } from "@saflib/ory-kratos-sdk";
import {
  AUTH_POST_AUTH_FALLBACK_HREF,
  AUTH_ROOT_HOME_FALLBACK_HREF,
} from "@saflib/ory-kratos-spa";

const postAuthFallbackHref = computed(() => linkToHrefWithHost(appLinks.home));
const rootHomeFallbackHref = computed(() => linkToHrefWithHost(rootLinks.home));
provide(AUTH_POST_AUTH_FALLBACK_HREF, postAuthFallbackHref);
provide(AUTH_ROOT_HOME_FALLBACK_HREF, rootHomeFallbackHref);

const sessionQuery = useKratosSession();
const loggedIn = computed(() => !!sessionQuery.data.value?.identity);
const isAdmin = computed(() => false);
</script>

<template>
  <HubLayout :logged-in="loggedIn" :is-admin="isAdmin">
    <router-view />
  </HubLayout>
</template>
