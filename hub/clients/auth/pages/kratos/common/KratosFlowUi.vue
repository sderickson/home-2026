<template>
  <v-card
    v-if="flow"
    variant="outlined"
    class="pa-4"
    :class="{ 'opacity-60': submitting }"
  >
    <form
      ref="formRef"
      class="kratos-flow-form"
      :aria-busy="submitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <v-alert
        v-for="(m, i) in flowMessages"
        :key="'flow-msg-' + i"
        :type="m.type === 'error' ? 'error' : 'info'"
        variant="tonal"
        class="mb-3"
        density="comfortable"
      >
        {{ m.text }}
      </v-alert>

      <fieldset class="kratos-flow-form__fieldset">
        <template v-for="(node, idx) in renderedNodes" :key="'node-' + idx">
          <template v-if="node.type === 'text'">
            <v-alert
              v-for="(nm, mi) in node.messages"
              :key="'text-nm-' + idx + '-' + mi"
              :type="nm.type === 'error' ? 'error' : 'info'"
              variant="tonal"
              class="mb-2"
              density="comfortable"
            >
              {{ nm.text }}
            </v-alert>
            <p class="text-body-2 mb-2">
              {{ (node.attributes as { text?: { text: string } }).text?.text }}
            </p>
          </template>

          <template v-else-if="includeImgNodes && node.type === 'img'">
            <v-alert
              v-for="(nm, mi) in node.messages"
              :key="'img-nm-' + idx + '-' + mi"
              :type="nm.type === 'error' ? 'error' : 'info'"
              variant="tonal"
              class="mb-2"
              density="comfortable"
            >
              {{ nm.text }}
            </v-alert>
            <div class="mb-4 d-flex justify-center">
              <img
                :src="String((node.attributes as { src?: string }).src ?? '')"
                :alt="node.meta?.label?.text ?? 'Authenticator QR code'"
                class="kratos-flow-form__qr"
              />
            </div>
          </template>

          <template
            v-else-if="isKratosInputNode(node) && !shouldHideSubmit(node)"
          >
            <v-alert
              v-for="(nm, mi) in node.messages"
              :key="'in-nm-' + idx + '-' + mi"
              :type="nm.type === 'error' ? 'error' : 'info'"
              variant="tonal"
              class="mb-2"
              density="comfortable"
            >
              {{ nm.text }}
            </v-alert>
            <input
              v-if="node.attributes.type === 'hidden'"
              type="hidden"
              :name="node.attributes.name"
              :value="node.attributes.value ?? undefined"
            />
            <v-btn
              v-else-if="node.attributes.type === 'submit'"
              :id="elementId(idx)"
              type="submit"
              color="primary"
              block
              size="large"
              variant="tonal"
              class="mb-8 mt-1"
              :name="node.attributes.name"
              :value="
                (node.attributes as { value?: string }).value ?? undefined
              "
              :loading="submitting"
              :disabled="submitting"
            >
              {{ kratosSubmitLabel(node) }}
            </v-btn>
            <v-text-field
              v-else
              :id="elementId(idx)"
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
import type { UiContainer, UiNode } from "@ory/client";
import { computed, ref } from "vue";
import { kratosPrependInnerIconForFieldName } from "./kratosVuetifyFieldIcons.ts";
import { useKratosFieldModelsForNodes } from "./useKratosFieldModelsForNodes.ts";
import { useKratosFlowFocusAfterUiChange } from "./useKratosFlowFocusAfterUiChange.ts";
import {
  isKratosInputNode,
  kratosEffectiveInputType,
} from "../registration/Registration.logic.ts";

/** Any browser self-service flow whose `ui.nodes` we render. */
export type KratosFlowUiModel = {
  ui: Pick<UiContainer, "nodes" | "messages">;
};

const props = withDefaults(
  defineProps<{
    flow: KratosFlowUiModel | null | undefined;
    /**
     * When set, render these nodes instead of `flow.ui.nodes` (e.g. settings tabs use a subset).
     */
    nodes?: UiNode[];
    submitting: boolean;
    /** Prefix for element `id`s (`${idPrefix}-${nodeIndex}`). */
    idPrefix?: string;
    /** Submit inputs to omit (e.g. in-flow resend when the page provides its own resend). */
    hideSubmitNames?: string[];
    /** Render `img` nodes (e.g. TOTP QR in settings). */
    includeImgNodes?: boolean;
  }>(),
  {
    idPrefix: "kratos-flow",
    hideSubmitNames: () => [],
    includeImgNodes: true,
  },
);

const flowMessages = computed(() => props.flow?.ui.messages ?? []);

const renderedNodes = computed(
  () => props.nodes ?? props.flow?.ui.nodes ?? [],
);

const flowForFocus = computed(() => {
  const f = props.flow;
  if (!f) return null;
  return {
    ui: {
      ...f.ui,
      nodes: renderedNodes.value,
    },
  };
});

const formRef = ref<HTMLFormElement | null>(null);
useKratosFlowFocusAfterUiChange(flowForFocus, formRef);

const { fieldModels, passwordVisible } =
  useKratosFieldModelsForNodes(renderedNodes);

const prefix = computed(() => props.idPrefix);
function elementId(idx: number) {
  return `${prefix.value}-${idx}`;
}

function shouldHideSubmit(node: UiNode): boolean {
  if (!isKratosInputNode(node)) return false;
  if (node.attributes.type !== "submit") return false;
  const name = node.attributes.name;
  return props.hideSubmitNames.includes(name);
}

function kratosSubmitLabel(node: UiNode) {
  if (!isKratosInputNode(node)) return "";
  const t = node.meta?.label?.text?.trim();
  if (t) return t;
  const v = (node.attributes as { value?: string }).value;
  return v != null ? String(v) : "";
}

const emit = defineEmits<{
  submit: [form: HTMLFormElement, submitter: HTMLElement | null];
}>();

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
  if (kratosEffectiveInputType(node.attributes) !== "password")
    return undefined;
  return passwordVisible.value[idx] ? "mdi-eye-off" : "mdi-eye";
}

function togglePasswordVisibility(idx: number, node: UiNode) {
  if (!isKratosInputNode(node)) return;
  if (kratosEffectiveInputType(node.attributes) !== "password") return;
  passwordVisible.value = {
    ...passwordVisible.value,
    [idx]: !passwordVisible.value[idx],
  };
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

.kratos-flow-form__qr {
  width: 192px;
  height: 192px;
  object-fit: contain;
}
</style>
