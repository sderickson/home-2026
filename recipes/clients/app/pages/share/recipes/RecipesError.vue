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
import { TanstackError } from "@saflib/sdk";
import { AsyncPageError } from "@saflib/vue/components";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { share_recipes as strings } from "./Recipes.strings.ts";

const props = defineProps<{
  error?: unknown;
  message?: string;
}>();

const { t } = useReverseT();

/** Unknown id: real API returns 404; MSW fakes may yield "No data returned". */
const isNotFound = computed(() => {
  const err = props.error;
  if (!(err instanceof TanstackError)) return false;
  return err.status === 404 || err.code === "No data returned";
});
</script>
