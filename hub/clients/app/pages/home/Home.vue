<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <p>{{ t(strings.subtitle) }}</p>

    <h2 class="text-h6 mt-6 mb-2">{{ t(strings.products_heading) }}</h2>
    <div class="d-flex flex-wrap ga-3">
      <v-btn v-bind="recipesHomeLinkProps" color="primary" variant="tonal">
        {{ t(strings.cta_recipes) }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { home_page as strings } from "./Home.strings.ts";
import {
  getRecipesHomeLinkProps,
} from "./Home.logic.ts";
import { useHomeLoader } from "./Home.loader.ts";
import { useReverseT } from "@sderickson/hub-app-spa/i18n";

const { t } = useReverseT();
useHomeLoader();

const recipesHomeLinkProps = getRecipesHomeLinkProps();
</script>
