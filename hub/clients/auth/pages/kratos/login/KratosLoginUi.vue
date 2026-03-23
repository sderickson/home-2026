<template>
  <v-card v-if="flow" variant="outlined" class="pa-4">
    <div
      v-for="(m, i) in flow.ui.messages ?? []"
      :key="'lm-' + i"
      class="text-body-2 mb-2"
      :class="m.type === 'error' ? 'text-error' : ''"
    >
      {{ m.text }}
    </div>
    <form @submit.prevent="onSubmit">
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
          <input
            :id="'kratos-login-' + idx"
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
</template>

<script setup lang="ts">
import type { LoginFlow } from "@ory/client";
import { isKratosInputNode } from "../registration/Registration.logic.ts";

defineProps<{
  flow: LoginFlow | null | undefined;
  submitting: boolean;
}>();

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
