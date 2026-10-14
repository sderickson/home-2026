<template>
  <v-container v-if="isNotFound" class="pa-6">
    <v-alert type="info" variant="tonal" class="pa-6">
      <v-alert-title>{{ t(strings.not_found_title) }}</v-alert-title>
      <p class="my-4 mb-0">{{ t(strings.not_found_message) }}</p>
    </v-alert>
  </v-container>
  <AsyncPageError v-else :error="error" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AsyncPageError } from "@saflib/vue/components";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { isSharedRecipeNotFound } from "../recipes/Recipes.logic.ts";
import { share_menus_error as strings } from "./MenusError.strings.ts";

const props = defineProps<{
  error?: unknown;
  message?: string;
}>();

const { t } = useReverseT();

/** Same 404 / "No data returned" check as the shared recipe page. */
const isNotFound = computed(() => isSharedRecipeNotFound(props.error));
</script>
