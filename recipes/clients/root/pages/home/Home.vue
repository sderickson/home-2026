<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>
    <v-btn v-bind="registerLinkProps" color="primary">
      {{ t(strings.cta_register) }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/recipes-root-spa/i18n";
import { linkToProps } from "@saflib/links";
import { authLinks } from "@saflib/auth-links";

const { t } = useReverseT();
useHomeLoader();

const registerLinkProps = linkToProps(authLinks.register, {
  params: { redirect: window.location.href },
});
</script>
