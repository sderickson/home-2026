<template>
  <div>
    <RegistrationIntro />
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
import RegistrationIntro from "./RegistrationIntro.vue";
import { useRegistrationFlow } from "./useRegistrationFlow.ts";
import type { RegistrationFlow } from "@ory/client";

const props = defineProps<{ flow: RegistrationFlow }>();

const { submitting, submitError, clearSubmitError, submitRegistrationForm } =
  useRegistrationFlow(toRef(props, "flow"));
</script>
