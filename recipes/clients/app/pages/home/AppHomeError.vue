<template>
  <v-container v-if="is401">
    <v-alert type="info" variant="tonal" class="my-4">
      <v-alert-title>{{ t(strings.not_logged_in) }}</v-alert-title>
      <div class="d-flex flex-wrap gap-2 mt-2">
        <v-btn v-bind="loginLinkProps" color="primary">
          {{ t(strings.cta_login) }}
        </v-btn>
        <v-btn variant="outlined" @click="enterDemoModeFromError">
          {{ t(strings.cta_demo) }}
        </v-btn>
      </div>
    </v-alert>
  </v-container>
  <AsyncPageError v-else :error="error" :message="errorMessage" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AsyncPageError } from "@saflib/vue/components";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { home_page as strings } from "./Home.strings.ts";
import {
  getLoginLinkProps,
  enterDemoModeFromError,
} from "./Home.logic.ts";

const props = defineProps<{
  error?: unknown;
  errorMessage?: string;
}>();

const { t } = useReverseT();

const is401 = computed(
  () => (props.error as { status?: number } | undefined)?.status === 401,
);

const loginLinkProps = getLoginLinkProps();
</script>
