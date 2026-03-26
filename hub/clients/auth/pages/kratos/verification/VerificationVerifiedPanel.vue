<template>
  <div>
    <h1 class="text-h4 mb-2">{{ t(strings.title) }}</h1>
    <p class="text-h6 text-medium-emphasis mb-2">{{ t(strings.subtitle) }}</p>
    <p class="text-body-1 text-medium-emphasis mb-6">{{ t(strings.description) }}</p>
    <v-btn color="primary" tag="a" :href="continueHref">
      {{ t(strings.cta_continue) }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { verification_verified as strings } from "./VerificationIntro.strings.ts";

defineProps<{
  continueHref: string;
}>();

const { t } = useReverseT();
</script>
