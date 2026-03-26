<template>
  <v-card v-if="flow" variant="outlined" class="pa-4" :class="{ 'opacity-60': submitting }">
    <form
      ref="formRef"
      class="kratos-flow-form"
      :aria-busy="submitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <v-alert
        v-for="(m, i) in flow.ui.messages ?? []"
        :key="'lm-' + i"
        :type="m.type === 'error' ? 'error' : 'info'"
        variant="tonal"
        class="mb-3"
        density="comfortable"
      >
        {{ m.text }}
      </v-alert>

      <fieldset class="kratos-flow-form__fieldset">
        <template v-for="(node, idx) in flow.ui.nodes" :key="'ln-' + idx">
          <p v-if="node.type === 'text'" class="text-body-2 mb-2">
            {{ (node.attributes as { text?: { text: string } }).text?.text }}
          </p>
          <template v-else-if="isKratosInputNode(node)">
            <input
              v-if="node.attributes.type === 'hidden'"
              type="hidden"
              :name="node.attributes.name"
              :value="node.attributes.value ?? undefined"
            />
            <v-btn
              v-else-if="node.attributes.type === 'submit'"
              :id="'kratos-login-' + idx"
              type="submit"
              color="primary"
              block
              size="large"
              variant="tonal"
              class="mb-8 mt-1"
              :name="node.attributes.name"
              :value="(node.attributes as { value?: string }).value ?? undefined"
              :loading="submitting"
              :disabled="submitting"
            >
              {{ kratosSubmitLabel(node) }}
            </v-btn>
            <v-text-field
              v-else
              :id="'kratos-login-' + idx"
              v-model="fieldModels[idx]"
              :name="node.attributes.name"
              :type="effectiveInputType(node, idx)"
              :label="node.meta?.label?.text"
              :required="node.attributes.required"
              :prepend-inner-icon="prependIcon(node)"
              :append-inner-icon="appendPasswordIcon(node, idx)"
              :disabled="submitting"
              density="comfortable"
              class="mb-4"
              autocomplete="off"
              @click:append-inner="togglePasswordVisibility(idx, node)"
            />
          </template>
        </template>
      </fieldset>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import type { LoginFlow, RegistrationFlow, UiNode } from "@ory/client";
import { ref, toRef } from "vue";
import { kratosPrependInnerIconForFieldName } from "../common/kratosVuetifyFieldIcons.ts";
import { useKratosFieldModelsForFlowNodes } from "../common/useKratosFieldModelsForNodes.ts";
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

const { fieldModels, passwordVisible } = useKratosFieldModelsForFlowNodes(flowRef);

const emit = defineEmits<{
  submit: [form: HTMLFormElement, submitter: HTMLElement | null];
}>();

function kratosSubmitLabel(node: UiNode) {
  if (!isKratosInputNode(node)) return "";
  const t = node.meta?.label?.text?.trim();
  if (t) return t;
  const v = (node.attributes as { value?: string }).value;
  return v != null ? String(v) : "";
}

function prependIcon(node: UiNode): string | undefined {
  if (!isKratosInputNode(node)) return undefined;
  return kratosPrependInnerIconForFieldName(node.attributes.name);
}

function effectiveInputType(node: UiNode, idx: number): string {
  if (!isKratosInputNode(node)) return "text";
  const eff = kratosEffectiveInputType(node.attributes);
  if (eff === "password" && passwordVisible.value[idx]) return "text";
  return eff;
}

function appendPasswordIcon(node: UiNode, idx: number): string | undefined {
  if (!isKratosInputNode(node)) return undefined;
  if (kratosEffectiveInputType(node.attributes) !== "password") return undefined;
  return passwordVisible.value[idx] ? "mdi-eye-off" : "mdi-eye";
}

function togglePasswordVisibility(idx: number, node: UiNode) {
  if (!isKratosInputNode(node)) return;
  if (kratosEffectiveInputType(node.attributes) !== "password") return;
  passwordVisible.value = { ...passwordVisible.value, [idx]: !passwordVisible.value[idx] };
}

function onSubmit(ev: Event) {
  const el = ev.currentTarget;
  if (el instanceof HTMLFormElement) {
    emit("submit", el, (ev as SubmitEvent).submitter);
  }
}
</script>

<style scoped>
.kratos-flow-form__fieldset {
  border: none;
  margin: 0;
  padding: 0;
  min-width: 0;
}
</style>
