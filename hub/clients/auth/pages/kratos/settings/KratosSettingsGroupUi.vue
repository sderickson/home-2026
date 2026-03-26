<template>
  <v-card v-if="flow && nodes.length" variant="outlined" class="pa-4">
    <v-alert
      v-for="(m, i) in nodeMessages"
      :key="'nm-' + i"
      :type="m.type === 'error' ? 'error' : 'info'"
      variant="tonal"
      class="mb-3"
      density="comfortable"
    >
      {{ m.text }}
    </v-alert>
    <form @submit.prevent="onSubmit">
      <fieldset class="kratos-flow-form__fieldset">
        <template v-for="(node, idx) in nodes" :key="'sn-' + idx">
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
              :id="prefix + '-' + idx"
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
              {{ kratosSubmitButtonLabel(node) }}
            </v-btn>
            <v-text-field
              v-else
              :id="prefix + '-' + idx"
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
  <p v-else-if="flow" class="text-body-2 text-medium-emphasis">
    {{ t(emptyCopy) }}
  </p>
</template>

<script setup lang="ts">
import type { SettingsFlow, UiNode } from "@ory/client";
import { computed } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { kratosPrependInnerIconForFieldName } from "../common/kratosVuetifyFieldIcons.ts";
import { useKratosFieldModelsForNodes } from "../common/useKratosFieldModelsForNodes.ts";
import { isKratosInputNode, kratosEffectiveInputType } from "../registration/Registration.logic.ts";
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

const { fieldModels, passwordVisible } = useKratosFieldModelsForNodes(nodes);

function kratosSubmitButtonLabel(node: UiNode): string {
  const lab = node.meta?.label?.text?.trim();
  if (lab) return lab;
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
</style>
