<template>
  <div>
    <div class="d-flex flex-column flex-sm-row align-sm-center ga-2 mb-4">
      <span class="text-body-2 text-medium-emphasis">{{
        t(strings.resend_help)
      }}</span>
      <v-btn
        variant="tonal"
        size="small"
        tag="a"
        :href="newVerificationHref"
        :disabled="submitting"
        :aria-label="t(strings.cta_resend_code)"
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
import { useNewVerificationEntryHref } from "./useNewVerificationEntryHref.ts";
import type { VerificationFlow } from "@ory/client";

const props = defineProps<{
  flow: VerificationFlow;
  verificationToken: string;
}>();

const { t } = useReverseT();

const newVerificationHref = useNewVerificationEntryHref(() => props.flow.return_to);

const {
  submitting,
  submitError,
  clearSubmitError,
  submitVerificationForm,
} = useVerificationFlow(toRef(props, "verificationToken"), () => props.flow.id);
</script>
