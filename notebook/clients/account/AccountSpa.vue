<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { DynamicNotebookLayout } from "@sderickson/notebook-clients-common/components";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/notebook-links";
import { configureAuthApp } from "@saflib/ory-kratos-spa";

configureAuthApp({
  showFlowHeaders: false,
  postAuthFallbackHref: computed(() => linkToHrefWithHost(appLinks.home)),
});

const route = useRoute();
/** Email verification must stay reachable without a session (registration handoff, courier links). */
const blankShell = computed(() =>
  route.matched.some((record) => record.meta.blankShell === true),
);
</script>

<template>
  <router-view v-if="blankShell" />
  <DynamicNotebookLayout v-else require-auth>
    <router-view />
  </DynamicNotebookLayout>
</template>
