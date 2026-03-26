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
import KratosLoginUi from "../login/KratosLoginUi.vue";
import { useRegistrationFlow } from "./useRegistrationFlow.ts";

const props = defineProps<{ flowId: string }>();

const {
  flow,
  submitting,
  submitError,
  clearSubmitError,
  submitRegistrationForm,
} = useRegistrationFlow(toRef(props, "flowId"));
</script>
