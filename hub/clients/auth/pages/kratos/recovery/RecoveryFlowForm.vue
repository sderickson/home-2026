<template>
  <div>
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
      @submit="(form, submitter) => submitRecoveryForm(form, submitter)"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import KratosRecoveryUi from "./KratosRecoveryUi.vue";
import { useRecoveryFlow } from "./useRecoveryFlow.ts";

const props = defineProps<{
  flowId: string;
  /** Kratos browser-flow `return_to` (see loader / `resolveLoginBrowserReturnTo`). */
  browserReturnTo: string;
  /** Optional token from `?token=` when the recovery email includes it. */
  recoveryToken?: string;
}>();

const { flow, submitting, submitError, clearSubmitError, submitRecoveryForm } =
  useRecoveryFlow(
    toRef(props, "flowId"),
    toRef(props, "browserReturnTo"),
    toRef(props, "recoveryToken"),
  );
</script>
