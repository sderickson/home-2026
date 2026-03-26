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
      @submit="submitLoginForm"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import KratosLoginUi from "./KratosLoginUi.vue";
import { useLoginFlow } from "./useLoginFlow.ts";
import type { LoginFlow } from "@ory/client";

const props = defineProps<{
  flow: LoginFlow;
}>();

const { submitting, submitError, clearSubmitError, submitLoginForm } =
  useLoginFlow(toRef(props, "flow"));
</script>
