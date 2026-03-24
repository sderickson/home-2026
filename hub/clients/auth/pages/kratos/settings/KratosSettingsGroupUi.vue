<template>
  <v-card v-if="flow && nodes.length" variant="outlined" class="pa-4">
    <div
      v-for="(m, i) in nodeMessages"
      :key="'nm-' + i"
      class="text-body-2 mb-2"
      :class="m.type === 'error' ? 'text-error' : ''"
    >
      {{ m.text }}
    </div>
    <form @submit.prevent="onSubmit">
      <template v-for="(node, idx) in nodes" :key="'sn-' + idx">
        <p v-if="node.type === 'text'" class="text-body-2 mb-2">
          {{ (node.attributes as { text?: { text: string } }).text?.text }}
        </p>
        <div v-else-if="isKratosInputNode(node)" class="mb-3">
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
  <p v-else-if="flow" class="text-body-2 text-medium-emphasis">
    {{ t(emptyCopy) }}
  </p>
</template>

<script setup lang="ts">
import type { SettingsFlow, UiNode } from "@ory/client";
import { computed } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { isKratosInputNode } from "../registration/Registration.logic.ts";
import { settings_group_empty as strings } from "./Settings.strings.ts";
import { settingsNodesForGroup } from "./Settings.logic.ts";

const props = defineProps<{
  flow: SettingsFlow;
  group: "profile" | "password";
  submitting: boolean;
  idPrefix: string;
}>();

const { t } = useReverseT();

const emptyCopy = computed(() =>
  props.group === "profile" ? strings.no_profile_fields : strings.no_password_fields,
);

const nodes = computed(() => settingsNodesForGroup(props.flow, props.group));

const nodeMessages = computed(() =>
  nodes.value.flatMap((n) => (n.messages?.length ? n.messages : [])),
);

const prefix = computed(() => props.idPrefix);

function kratosSubmitButtonLabel(node: UiNode): string {
  const lab = node.meta?.label?.text?.trim();
  if (lab) return lab;
  const v = (node.attributes as { value?: string }).value;
  return v != null ? String(v) : "";
}

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
