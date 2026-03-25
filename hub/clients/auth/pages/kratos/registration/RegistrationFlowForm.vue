<template>
  <div>
    <p class="text-body-1 mb-4">{{ t(strings.not_logged_in) }}</p>

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
      @submit="submitRegistrationForm"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import KratosLoginUi from "../login/KratosLoginUi.vue";
import { kratos_registration_flow as strings } from "./RegistrationFlowForm.strings.ts";
import { useRegistrationFlow } from "./useRegistrationFlow.ts";

const props = defineProps<{ flowId: string }>();

const { t } = useReverseT();

const {
  flow,
  submitting,
  submitError,
  clearSubmitError,
  submitRegistrationForm,
} = useRegistrationFlow(toRef(props, "flowId"));
</script>
