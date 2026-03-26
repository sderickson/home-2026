<template>
  <div>
    <p class="text-body-1 mb-2">{{ t(strings.not_signed_in) }}</p>
    <div
      class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between mb-4"
    >
      <a
        :href="recoveryHref"
        class="text-caption text-decoration-none text-primary"
      >
        {{ t(strings.forgot_password) }}
      </a>
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

    <KratosLoginUi
      v-if="flow"
      :flow="flow"
      :submitting="submitting"
      @submit="submitLoginForm"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { useAuthFlowCrossLinks } from "../common/useAuthFlowCrossLinks.ts";
import { kratos_login_flow as strings } from "./LoginFlowForm.strings.ts";
import KratosLoginUi from "./KratosLoginUi.vue";
import { useLoginFlow } from "./useLoginFlow.ts";

const props = defineProps<{
  flowId: string;
  /** Kratos browser-flow `return_to` (see loader / `resolveLoginBrowserReturnTo`). */
  browserReturnTo: string;
}>();

const { t } = useReverseT();
const { recoveryHref } = useAuthFlowCrossLinks();

const { flow, submitting, submitError, clearSubmitError, submitLoginForm } = useLoginFlow(
  toRef(props, "flowId"),
  toRef(props, "browserReturnTo"),
);
</script>
