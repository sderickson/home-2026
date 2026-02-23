<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p class="mb-4">{{ t(strings.description) }}</p>
    <v-btn v-bind="browseLinkProps" color="primary" class="me-2">
      {{ t(strings.cta_browse) }}
    </v-btn>
    <v-btn v-bind="registerLinkProps" variant="text">
      {{ t(strings.cta_register) }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/recipes-root-spa/i18n";
import { linkToProps, linkToHref, getHost } from "@saflib/links";
import { authLinks } from "@saflib/auth-links";
import { rootLinks, appLinks } from "@sderickson/recipes-links";

const { t } = useReverseT();
useHomeLoader();

const browseLinkProps = linkToProps(rootLinks.recipesList);

const registerLinkProps = linkToProps(authLinks.register, {
  params: { redirect: linkToHref(appLinks.home, { domain: getHost() }) },
});
</script>
