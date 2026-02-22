<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p class="mb-4">{{ t(strings.subtitle) }}</p>
    <v-btn v-bind="browseLinkProps" color="primary">
      {{ t(strings.cta_browse) }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { home_page as strings } from "./Home.strings.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { linkToProps } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";

const { t } = useReverseT();
const { profileQuery } = useHomeLoader();

if (!profileQuery.data.value) {
  throw new Error("Failed to load profile");
}

const browseLinkProps = linkToProps(appLinks.recipesList);
</script>
