<template>
  <v-card v-if="flow" variant="outlined" class="pa-4" :class="{ 'opacity-60': submitting }">
    <div
      v-for="(m, i) in flow.ui.messages ?? []"
      :key="'rm-' + i"
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
        <template v-for="(node, idx) in flow.ui.nodes" :key="'rn-' + idx">
          <p v-if="node.type === 'text'" class="text-body-2 mb-2">
            {{ (node.attributes as { text?: { text: string } }).text?.text }}
          </p>
          <div
            v-else-if="isKratosInputNode(node) && !isKratosRecoveryResendSubmitNode(node)"
            class="mb-3"
          >
            <label
              v-if="node.meta?.label?.text && node.attributes.type !== 'submit'"
              class="text-caption d-block mb-1"
              :for="prefix + '-' + idx"
            >
              {{ node.meta.label.text }}
            </label>
            <button
              v-if="node.attributes.type === 'submit'"
              :id="prefix + '-' + idx"
              type="submit"
              class="kratos-input kratos-input--submit mt-1 d-flex align-center justify-center ga-2"
              :name="node.attributes.name"
              :value="(node.attributes as { value?: string }).value ?? undefined"
              :disabled="submitting"
            >
              <v-progress-circular v-if="submitting" indeterminate size="20" width="2" />
              <span>{{ kratosSubmitButtonLabel(node) }}</span>
            </button>
            <input
              v-else
              :id="prefix + '-' + idx"
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
import type { RecoveryFlow, UiNode } from "@ory/client";
import { computed, ref, toRef } from "vue";
import { useKratosFlowFocusAfterUiChange } from "../common/useKratosFlowFocusAfterUiChange.ts";
import {
  isKratosInputNode,
  kratosEffectiveInputType,
} from "../registration/Registration.logic.ts";

/** In-form resend (`name=email` submit); prefer explicit resend UX if we add it later. */
function isKratosRecoveryResendSubmitNode(node: UiNode): boolean {
  if (!isKratosInputNode(node)) return false;
  return node.attributes.type === "submit" && node.attributes.name === "email";
}

function kratosSubmitButtonLabel(node: UiNode): string {
  const t = node.meta?.label?.text?.trim();
  if (t) return t;
  const v = (node.attributes as { value?: string }).value;
  return v != null ? String(v) : "";
}

const props = withDefaults(
  defineProps<{
    flow: RecoveryFlow | null | undefined;
    submitting: boolean;
    idPrefix?: string;
  }>(),
  { idPrefix: "kratos-recovery" },
);

const prefix = computed(() => props.idPrefix);
const flowRef = toRef(props, "flow");
const formRef = ref<HTMLFormElement | null>(null);
useKratosFlowFocusAfterUiChange(flowRef, formRef);

const emit = defineEmits<{
  submit: [form: HTMLFormElement, submitter: HTMLElement | null];
}>();

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
.kratos-input--submit:disabled {
  opacity: 0.85;
}
</style>
