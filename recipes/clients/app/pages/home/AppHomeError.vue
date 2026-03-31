<template>
  <v-container v-if="is401">
    <v-alert type="info" variant="tonal" class="pa-6">
      <v-alert-title>{{ t(strings.not_logged_in) }}</v-alert-title>
      <p class="my-4">
        {{ t(strings.not_logged_in_message) }}
      </p>
      <div class="d-flex flex-wrap gap-2 mt-2">
        <v-btn v-bind="loginLinkProps" color="primary" class="mr-4">
          {{ t(strings.cta_login) }}
        </v-btn>
        <v-btn color="primary" @click="enterDemoModeFromError">
          {{ t(strings.cta_demo) }}
        </v-btn>
      </div>
    </v-alert>
  </v-container>
  <v-container v-else-if="is403">
    <v-alert type="warning" variant="tonal" class="pa-6">
      <v-alert-title>{{ t(strings.verify_email_title) }}</v-alert-title>
      <p class="my-4 mb-0">
        <i18n-t
          scope="global"
          :keypath="lookupTKey(strings.verify_email_message)"
        >
          <template #resend>
            <a
              :href="newVerificationHref"
              class="text-primary text-decoration-underline"
            >
              {{ t(strings.verify_email_resend_link) }}
            </a>
          </template>
        </i18n-t>
      </p>
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
  getNewVerificationHref,
  enterDemoModeFromError,
} from "./Home.logic.ts";

const props = defineProps<{
  error?: unknown;
  errorMessage?: string;
}>();

const { t, lookupTKey } = useReverseT();

const is401 = computed(
  () => (props.error as { status?: number } | undefined)?.status === 401,
);

const is403 = computed(
  () => (props.error as { status?: number } | undefined)?.status === 403,
);

const loginLinkProps = getLoginLinkProps();
const newVerificationHref = getNewVerificationHref();
</script>
