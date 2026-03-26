<template>
  <div>
    <h1 class="text-h4 mb-2">{{ t(active.title) }}</h1>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { verification_intro as strings } from "./VerificationIntro.strings.ts";

const props = withDefaults(
  defineProps<{
    /** `request` — before a flow exists (send a code first). `enter` — code entry step. */
    variant?: "request" | "enter";
  }>(),
  { variant: "enter" },
);

const { t } = useReverseT();

const active = computed(() =>
  props.variant === "request"
    ? {
        title: strings.request_title,
      }
    : {
        title: strings.title,
      },
);
</script>
