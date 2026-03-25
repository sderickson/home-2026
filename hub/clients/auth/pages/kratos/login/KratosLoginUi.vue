<template>
  <v-card v-if="flow" variant="outlined" class="pa-4" :class="{ 'opacity-60': submitting }">
    <div
      v-for="(m, i) in flow.ui.messages ?? []"
      :key="'lm-' + i"
      class="text-body-2 mb-2"
      :class="m.type === 'error' ? 'text-error' : ''"
    >
      {{ m.text }}
    </div>
    <form
      ref="formRef"
      class="kratos-flow-form"
      :aria-busy="submitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <fieldset class="kratos-flow-form__fieldset" :disabled="submitting">
        <template v-for="(node, idx) in flow.ui.nodes" :key="'ln-' + idx">
          <p v-if="node.type === 'text'" class="text-body-2 mb-2">
            {{ (node.attributes as { text?: { text: string } }).text?.text }}
          </p>
          <div v-else-if="isKratosInputNode(node)" class="mb-3">
            <label
              v-if="node.meta?.label?.text && node.attributes.type !== 'submit'"
              class="text-caption d-block mb-1"
              :for="'kratos-login-' + idx"
            >
              {{ node.meta.label.text }}
            </label>
            <v-btn
              v-if="node.attributes.type === 'submit'"
              :id="'kratos-login-' + idx"
              type="submit"
              color="primary"
              block
              class="mt-1"
              :loading="submitting"
              :disabled="submitting"
            >
              {{ kratosSubmitLabel(node) }}
            </v-btn>
            <input
              v-else
              :id="'kratos-login-' + idx"
              class="kratos-input"
              :name="node.attributes.name"
              :type="kratosEffectiveInputType(node.attributes)"
              :value="node.attributes.value ?? undefined"
              :required="node.attributes.required"
              autocomplete="off"
            />
          </div>
        </template>
      </fieldset>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import type { LoginFlow, RegistrationFlow, UiNode } from "@ory/client";
import { ref, toRef } from "vue";
import { useKratosFlowFocusAfterUiChange } from "../common/useKratosFlowFocusAfterUiChange.ts";
import {
  isKratosInputNode,
  kratosEffectiveInputType,
} from "../registration/Registration.logic.ts";

const props = defineProps<{
  flow: LoginFlow | RegistrationFlow | null | undefined;
  submitting: boolean;
}>();

const flowRef = toRef(props, "flow");
const formRef = ref<HTMLFormElement | null>(null);
useKratosFlowFocusAfterUiChange(flowRef, formRef);

const emit = defineEmits<{
  submit: [form: HTMLFormElement];
}>();

function kratosSubmitLabel(node: UiNode) {
  if (!isKratosInputNode(node)) return "";
  const t = node.meta?.label?.text?.trim();
  if (t) return t;
  const v = (node.attributes as { value?: string }).value;
  return v != null ? String(v) : "";
}

function onSubmit(ev: Event) {
  const el = ev.currentTarget;
  if (el instanceof HTMLFormElement) emit("submit", el);
}
</script>

<style scoped>
.kratos-flow-form__fieldset {
  border: none;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.kratos-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.26);
  border-radius: 4px;
  font: inherit;
}
</style>
