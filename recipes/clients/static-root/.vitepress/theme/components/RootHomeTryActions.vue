<template>
  <div class="d-flex flex-wrap ga-3">
    <v-btn :href="registerHref" color="primary">Sign up</v-btn>
    <v-btn :href="demoHref" variant="outlined" color="primary">Try the demo</v-btn>
    <v-btn
      :href="sourceHref"
      variant="text"
      color="primary"
      target="_blank"
      rel="noopener noreferrer"
    >
      View source on GitHub
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { linkToHrefWithHost } from "@saflib/links";
import { useResolvedHref } from "@saflib/vue/useResolvedHref";
import { appLinks, authLinks } from "@sderickson/recipes-links";

const sourceHref = "https://github.com/sderickson/home-2026/tree/main/recipes";

const demoHref = useResolvedHref(appLinks.home);
const registerHref = useResolvedHref(() =>
  linkToHrefWithHost(authLinks.register, {
    params: { redirect: linkToHrefWithHost(appLinks.home) },
  }),
);
</script>
