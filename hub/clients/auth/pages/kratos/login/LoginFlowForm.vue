<template>
  <div>
    <p class="text-body-1 mb-4">{{ t(strings.not_signed_in) }}</p>

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
import { kratos_login_flow as strings } from "./LoginFlowForm.strings.ts";
import KratosLoginUi from "./KratosLoginUi.vue";
import { useLoginFlow } from "./useLoginFlow.ts";

const props = defineProps<{ flowId: string }>();

const { t } = useReverseT();

const { flow, submitting, submitError, clearSubmitError, submitLoginForm } = useLoginFlow(
  toRef(props, "flowId"),
);
</script>
