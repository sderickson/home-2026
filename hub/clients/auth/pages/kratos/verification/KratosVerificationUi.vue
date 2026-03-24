<template>
  <v-card v-if="flow" variant="outlined" class="pa-4">
    <div
      v-for="(m, i) in flow.ui.messages ?? []"
      :key="'vm-' + i"
      class="text-body-2 mb-2"
      :class="m.type === 'error' ? 'text-error' : ''"
    >
      {{ m.text }}
    </div>
    <form @submit.prevent="onSubmit">
      <template v-for="(node, idx) in flow.ui.nodes" :key="'vn-' + idx">
        <p v-if="node.type === 'text'" class="text-body-2 mb-2">
          {{ (node.attributes as { text?: { text: string } }).text?.text }}
        </p>
        <div
          v-else-if="isKratosInputNode(node) && !isKratosVerificationResendSubmitNode(node)"
          class="mb-3"
        >
          <label
            v-if="node.meta?.label?.text && node.attributes.type !== 'submit'"
            class="text-caption d-block mb-1"
            :for="prefix + '-' + idx"
          >
            {{ node.meta.label.text }}
          </label>
          <!-- Kratos uses value for form semantics (e.g. method=code); label text lives in meta.label. -->
          <button
            v-if="node.attributes.type === 'submit'"
            :id="prefix + '-' + idx"
            type="submit"
            class="kratos-input kratos-input--submit"
            :name="node.attributes.name"
            :value="node.attributes.value ?? undefined"
            :disabled="submitting"
          >
            {{ kratosSubmitButtonLabel(node) }}
          </button>
          <input
            v-else
            :id="prefix + '-' + idx"
            class="kratos-input"
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
</template>

<script setup lang="ts">
import type { UiNode, VerificationFlow } from "@ory/client";
import { computed } from "vue";
import { isKratosInputNode } from "../registration/Registration.logic.ts";

/** In-form resend (`name=email` submit); we resend outside this card (VerificationFlowForm). */
function isKratosVerificationResendSubmitNode(node: UiNode): boolean {
  if (!isKratosInputNode(node)) return false;
  return node.attributes.type === "submit" && node.attributes.name === "email";
}

/** Submit inputs only show `value` as the caption; Kratos puts human copy in meta.label. */
function kratosSubmitButtonLabel(node: UiNode): string {
  const t = node.meta?.label?.text?.trim();
  if (t) return t;
  const v = (node.attributes as { value?: string }).value;
  return v != null ? String(v) : "";
}

const props = withDefaults(
  defineProps<{
    flow: VerificationFlow | null | undefined;
    submitting: boolean;
    /** Prefix for input `id`s so multiple Kratos UIs on one page stay unique. */
    idPrefix?: string;
  }>(),
  { idPrefix: "kratos-verify" },
);

const prefix = computed(() => props.idPrefix);

const emit = defineEmits<{
  submit: [form: HTMLFormElement];
}>();

function onSubmit(ev: Event) {
  const el = ev.currentTarget;
  if (el instanceof HTMLFormElement) emit("submit", el);
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
