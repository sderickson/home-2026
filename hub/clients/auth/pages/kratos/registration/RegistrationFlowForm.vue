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

    <v-card v-if="flow" variant="outlined" class="pa-4">
      <div
        v-for="(m, i) in flow.ui.messages ?? []"
        :key="'rm-' + i"
        class="text-body-2 mb-2"
        :class="m.type === 'error' ? 'text-error' : ''"
      >
        {{ m.text }}
      </div>
      <form @submit.prevent="handleSubmit">
        <template v-for="(node, idx) in flow.ui.nodes" :key="'rn-' + idx">
          <p v-if="node.type === 'text'" class="text-body-2 mb-2">
            {{ (node.attributes as { text?: { text: string } }).text?.text }}
          </p>
          <div v-else-if="isKratosInputNode(node)" class="mb-3">
            <label
              v-if="node.meta?.label?.text && node.attributes.type !== 'submit'"
              class="text-caption d-block mb-1"
              :for="'reg-' + idx"
            >
              {{ node.meta.label.text }}
            </label>
            <input
              :id="'reg-' + idx"
              class="kratos-input"
              :class="{ 'kratos-input--submit': node.attributes.type === 'submit' }"
              :name="node.attributes.name"
              :type="node.attributes.type"
              :value="node.attributes.value ?? undefined"
              :required="node.attributes.required"
              :disabled="submitting"
              autocomplete="off"
            />
          </div>
        </template>
      </form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { kratos_registration_flow as strings } from "./RegistrationFlowForm.strings.ts";
import { isKratosInputNode } from "./Registration.logic.ts";
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

function handleSubmit(ev: Event) {
  const el = ev.currentTarget;
  if (el instanceof HTMLFormElement) {
    submitRegistrationForm(el);
  }
}
</script>

<style scoped>
.kratos-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.26);
  border-radius: 4px;
  font: inherit;
}
.kratos-input--submit {
  cursor: pointer;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border: none;
  font-weight: 600;
}
</style>
