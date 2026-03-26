<template>
  <div>
    <h1 class="text-h4 mb-2">{{ t(strings.title) }}</h1>
    <v-btn color="primary" tag="a" :href="returnTo">
      {{ t(strings.cta_continue) }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { verification_verified as strings } from "./VerificationIntro.strings.ts";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";

const postAuthFallbackHref = useAuthPostAuthFallbackHref();
const route = useRoute();
const returnTo = computed(() =>
  typeof route.query.return_to === "string"
    ? route.query.return_to
    : postAuthFallbackHref.value,
);

const { t } = useReverseT();
</script>
