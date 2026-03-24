<template>
  <div>
    <p class="text-body-1 mb-4">{{ t(strings.instructions) }}</p>

    <div v-if="resendEmail" class="d-flex flex-column flex-sm-row align-sm-center ga-2 mb-4">
      <span class="text-body-2 text-medium-emphasis">{{ t(strings.resend_help) }}</span>
      <v-btn
        variant="tonal"
        size="small"
        :loading="resending"
        :disabled="submitting"
        @click="resendVerificationCode"
      >
        {{ t(strings.cta_resend_code) }}
      </v-btn>
    </div>

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
  resendEmail,
  submitting,
  resending,
  submitError,
  clearSubmitError,
  submitVerificationForm,
  resendVerificationCode,
} = useVerificationFlow(
  toRef(props, "flowId"),
  toRef(props, "browserReturnTo"),
  toRef(props, "verificationToken"),
);
</script>
