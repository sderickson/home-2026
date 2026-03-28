<template>
  <div>
    <LoginIntro :flow-return-to="flow.return_to" />
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
      id-prefix="kratos-login"
      :intercept-ory-programmatic-submit="interceptOryProgrammaticSubmit"
      merge-passkey-trigger-into-identifier
      @submit="(form, submitter) => submitLoginForm(form, submitter)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import KratosFlowUi from "../common/KratosFlowUi.vue";
import LoginIntro from "./LoginIntro.vue";
import { useLoginFlow } from "./useLoginFlow.ts";
import type { LoginFlow } from "@ory/client";

const props = defineProps<{
  flow: LoginFlow;
}>();

const { submitting, submitError, clearSubmitError, submitLoginForm } =
  useLoginFlow(toRef(props, "flow"));

/** Ory `webauthn.js` calls `form.submit()` after passkey login; patch so `@submit.prevent` runs (see `kratosFormSubmitOryPatch.ts`). */
const interceptOryProgrammaticSubmit = computed(() =>
  props.flow.ui.nodes.some((n) => n.group === "passkey" || n.group === "webauthn"),
);
</script>
