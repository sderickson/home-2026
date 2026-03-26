<template>
  <v-container class="py-8" max-width="720">
    <v-alert type="info" variant="tonal">
      Re-authentication required. Redirecting to sign in...
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";

const props = defineProps<{
  redirectBrowserTo?: string;
}>();

onMounted(() => {
  const loginUrl = new URL(linkToHrefWithHost(authLinks.kratosLogin), window.location.origin);
  if (props.redirectBrowserTo) {
    try {
      const kratosRedirect = new URL(props.redirectBrowserTo);
      const refresh = kratosRedirect.searchParams.get("refresh");
      const returnTo = kratosRedirect.searchParams.get("return_to");
      if (refresh) {
        loginUrl.searchParams.set("refresh", refresh);
      }
      if (returnTo) {
        loginUrl.searchParams.set("return_to", returnTo);
      }
    } catch {
      // Fall back to plain login.
    }
  }
  window.location.replace(loginUrl.toString());
});
</script>
