<template>
  <v-container class="py-8" max-width="720">
    <v-alert type="info" variant="tonal" class="mb-4">
      {{ t(strings.message) }}
    </v-alert>
    <v-btn color="primary" @click="restartVerification">
      {{ t(strings.cta_restart) }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { verification_flow_expired as strings } from "./VerificationFlowExpired.strings.ts";

const route = useRoute();
const router = useRouter();
const { t } = useReverseT();

function restartVerification() {
  const next: Record<string, string> = {};
  if (typeof route.query.redirect === "string") {
    next.redirect = route.query.redirect;
  }
  void router.replace({
    path: route.path,
    query: next,
  });
}
</script>
