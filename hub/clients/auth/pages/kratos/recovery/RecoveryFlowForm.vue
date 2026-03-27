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

    <KratosFlowUi
      v-if="flow"
      :flow="flow"
      :submitting="submitting"
      id-prefix="kratos-recovery"
      :hide-submit-names="['email']"
      @submit="(form, submitter) => submitRecoveryForm(form, submitter)"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import KratosFlowUi from "../common/KratosFlowUi.vue";
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
