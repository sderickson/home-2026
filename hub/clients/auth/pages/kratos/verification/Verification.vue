<template>
  <v-container class="py-8" max-width="720">
    <VerificationIntro />
    <VerificationFlowForm
      v-if="flowIdForForm"
      :flow-id="flowIdForForm"
      :browser-return-to="browserReturnTo"
      :verification-token="verificationToken"
    />
  </v-container>
</template>

<script setup lang="ts">
import { useVerificationRouteSync } from "./useVerificationRouteSync.ts";
import VerificationFlowForm from "./VerificationFlowForm.vue";
import VerificationIntro from "./VerificationIntro.vue";

const { browserReturnTo, flowIdForForm, verificationToken } = useVerificationRouteSync();
</script>
