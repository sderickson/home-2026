<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { linkToHrefWithHost } from "@saflib/links";
import { fetchBrowserLogoutFlow } from "@saflib/ory-kratos-sdk";
import { authLinks } from "@sderickson/hub-links";

const route = useRoute();

onMounted(async () => {
  const q = route.query.return_to;
  const fromQuery = typeof q === "string" && q.trim() ? q.trim() : undefined;
  const returnTo = fromQuery ?? linkToHrefWithHost(authLinks.home);
  const { logout_url } = await fetchBrowserLogoutFlow(returnTo);
  window.location.assign(logout_url);
});
</script>

<template>
  <div class="d-flex justify-center align-center flex-column fill-height">
    <v-progress-circular
      indeterminate
      size="64"
      color="primary"
      class="mt-16 mb-4"
    />
    <div class="text-h6">Signing out…</div>
  </div>
</template>
