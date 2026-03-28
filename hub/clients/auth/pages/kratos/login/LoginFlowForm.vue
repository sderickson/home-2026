<template>
  <div>
    <LoginIntro
      :flow-return-to="flow.return_to"
      :second-factor="isSecondFactorStep"
    />
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
      :split-login-second-factor-groups-into-tabs="loginUsesMfaGroupTabs"
      :resolve-group-tab-label="resolveLoginGroupTabLabel"
      merge-passkey-trigger-into-identifier
      @submit="(form, submitter) => submitLoginForm(form, submitter)"
    />
  </div>
</template>

<script setup lang="ts">
import { AuthenticatorAssuranceLevel } from "@ory/client";
import type { LoginFlow } from "@ory/client";
import { computed, toRef } from "vue";
import KratosFlowUi from "../common/KratosFlowUi.vue";
import LoginIntro from "./LoginIntro.vue";
import { login_intro } from "./LoginIntro.strings.ts";
import { useLoginFlow } from "./useLoginFlow.ts";

const props = defineProps<{
  flow: LoginFlow;
}>();

const { submitting, submitError, clearSubmitError, submitLoginForm } =
  useLoginFlow(toRef(props, "flow"));

/** Ory `webauthn.js` calls `form.submit()` after passkey login; patch so `@submit.prevent` runs (see `kratosFormSubmitOryPatch.ts`). */
const interceptOryProgrammaticSubmit = computed(() =>
  props.flow.ui.nodes.some((n) => n.group === "passkey" || n.group === "webauthn"),
);

const isSecondFactorStep = computed(
  () => props.flow.requested_aal === AuthenticatorAssuranceLevel.Aal2,
);

const loginUsesMfaGroupTabs = computed(() => {
  if (!isSecondFactorStep.value) return false;
  const groups = new Set<string>();
  for (const n of props.flow.ui.nodes) {
    const g = n.group ?? "default";
    if (g !== "default") groups.add(g);
  }
  return groups.size > 1;
});

function resolveLoginGroupTabLabel(group: string): string {
  const s = login_intro;
  const map: Record<string, string> = {
    code: s.mfa_tab_code,
    totp: s.mfa_tab_totp,
    webauthn: s.mfa_tab_webauthn,
    passkey: s.mfa_tab_passkey,
    lookup_secret: s.mfa_tab_lookup_secret,
  };
  return map[group] ?? group.replace(/_/g, " ");
}
</script>
