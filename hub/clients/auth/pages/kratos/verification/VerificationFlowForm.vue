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

    <KratosVerificationUi
      v-if="flow"
      :flow="flow"
      :submitting="submitting"
      @submit="submitVerificationForm"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import KratosVerificationUi from "./KratosVerificationUi.vue";
import { kratos_verification_flow as strings } from "./VerificationFlowForm.strings.ts";
import { useVerificationFlow } from "./useVerificationFlow.ts";

const props = defineProps<{
  flowId: string;
  /** Kratos browser-flow `return_to` (see loader / `resolveLoginBrowserReturnTo`). */
  browserReturnTo: string;
  /** Optional token from `?token=` when the verification email includes it. */
  verificationToken?: string;
}>();

const { t } = useReverseT();

const {
  flow,
  submitting,
  submitError,
  clearSubmitError,
  submitVerificationForm,
} = useVerificationFlow(
  toRef(props, "flowId"),
  toRef(props, "browserReturnTo"),
  toRef(props, "verificationToken"),
);
</script>
