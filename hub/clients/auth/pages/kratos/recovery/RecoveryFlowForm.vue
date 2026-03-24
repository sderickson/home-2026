<template>
  <div>
    <p class="text-body-1 mb-4">{{ t(strings.instructions) }}</p>

    <v-alert
      v-if="submitError"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="clearSubmitError"
    >
      {{ submitError }}
    </v-alert>

    <KratosRecoveryUi
      v-if="flow"
      :flow="flow"
      :submitting="submitting"
      @submit="submitRecoveryForm"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import KratosRecoveryUi from "./KratosRecoveryUi.vue";
import { kratos_recovery_flow as strings } from "./RecoveryFlowForm.strings.ts";
import { useRecoveryFlow } from "./useRecoveryFlow.ts";

const props = defineProps<{
  flowId: string;
  /** Kratos browser-flow `return_to` (see loader / `resolveLoginBrowserReturnTo`). */
  browserReturnTo: string;
  /** Optional token from `?token=` when the recovery email includes it. */
  recoveryToken?: string;
}>();

const { t } = useReverseT();

const {
  flow,
  submitting,
  submitError,
  clearSubmitError,
  submitRecoveryForm,
} = useRecoveryFlow(
  toRef(props, "flowId"),
  toRef(props, "browserReturnTo"),
  toRef(props, "recoveryToken"),
);
</script>
