<template>
  <v-container class="py-8" max-width="720">
    <RecoveryIntro />
    <RecoveryFlowForm
      v-if="flowIdForForm"
      :flow-id="flowIdForForm"
      :browser-return-to="browserReturnTo"
      :recovery-token="recoveryToken"
    />
  </v-container>
</template>

<script setup lang="ts">
import RecoveryFlowForm from "./RecoveryFlowForm.vue";
import RecoveryIntro from "./RecoveryIntro.vue";
import { useRecoveryRouteSync } from "./useRecoveryRouteSync.ts";

const { browserReturnTo, flowIdForForm, recoveryToken } = useRecoveryRouteSync();
</script>
