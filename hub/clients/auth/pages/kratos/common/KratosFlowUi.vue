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
      novalidate
      :aria-busy="submitting ? 'true' : undefined"
      @pointerdown.capture="onFormPointerDownCapture"
      @submit.prevent="onSubmit"
    >
      <v-alert
        v-for="(m, i) in visibleFlowMessages"
        :key="'flow-msg-' + i"
        :type="m.type === 'error' ? 'error' : 'info'"
        variant="tonal"
        class="mb-3"
        density="comfortable"
      >
        {{ m.text }}
      </v-alert>

      <fieldset class="kratos-flow-form__fieldset">
        <template v-for="(node, idx) in displayNodes" :key="'node-' + idx">
          <template v-if="node.type === 'text'">
            <v-alert
              v-for="(nm, mi) in visibleNodeMessages(node, idx)"
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
              v-for="(nm, mi) in visibleNodeMessages(node, idx)"
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
              v-for="(nm, mi) in visibleNodeMessages(node, idx)"
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
              v-else-if="node.attributes.type === 'button'"
              :id="elementId(idx)"
              type="button"
              color="primary"
              block
              size="large"
              variant="tonal"
              class="mb-4 mt-1"
              :disabled="submitting"
              @click="runKratosWebAuthnInputClick(node)"
            >
              {{ kratosSubmitLabel(node) }}
            </v-btn>
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
              :append-inner-icon="appendInnerIcon(node, idx)"
              :disabled="submitting"
              density="comfortable"
              class="mb-4"
              :class="identifierPasskeyFieldClass(node)"
              autocomplete="off"
              @click:append-inner="onAppendInnerClick(idx, node)"
            />
          </template>
        </template>
      </fieldset>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import type { UiContainer, UiNode, UiText } from "@ory/client";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { KratosFlowUiMessageFilterContext } from "./kratosUiMessages.ts";
import { kratosPrependInnerIconForFieldName } from "./kratosVuetifyFieldIcons.ts";
import { useKratosFieldModelsForNodes } from "./useKratosFieldModelsForNodes.ts";
import { useKratosFlowFocusAfterUiChange } from "./useKratosFlowFocusAfterUiChange.ts";
import { useKratosOryWebAuthnScripts } from "./useKratosOryWebAuthnScripts.ts";
import { patchKratosFormSubmitForOryProgrammaticSubmit } from "./kratosFormSubmitOryPatch.ts";
import {
  filterOutMergedLoginTriggerButton,
  findPasskeyOrWebAuthnLoginTrigger,
  shouldMergePasskeyTriggerIntoIdentifier,
} from "./kratosLoginPasskeyInIdentifier.ts";
import { kratosPasskeyRemoveButtonLabel } from "./kratosPasskeyRemoveLabel.ts";
import { runKratosWebAuthnInputClick } from "./kratosWebAuthnInputClick.ts";
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
    /**
     * Return false to hide a message. Used e.g. to soften Kratos "Property … is missing" on the first
     * step of multi-field flows (registration: email → password).
     */
    messageFilter?: (
      message: UiText,
      context: KratosFlowUiMessageFilterContext,
    ) => boolean;
    /**
     * Ory `webauthn.js` calls `form.submit()` after passkey/WebAuthn, which skips `submit` events.
     * When true, patch this form so programmatic submit dispatches a cancelable event first (SPA
     * `@submit.prevent` runs; see `kratosFormSubmitOryPatch.ts`).
     */
    interceptOryProgrammaticSubmit?: boolean;
    /**
     * When Kratos labels a passkey as "unnamed" (no AAGUID display name), use this (e.g. account
     * email) for remove-button copy instead.
     */
    identityPasskeyDisplayFallback?: string;
    /**
     * Login only: hide the full-width “Sign in with passkey” button and put a passkey action
     * (`mdi-cloud-key`) on the identifier field instead (password field keeps the visibility toggle).
     */
    mergePasskeyTriggerIntoIdentifier?: boolean;
  }>(),
  {
    idPrefix: "kratos-flow",
    hideSubmitNames: () => [],
    includeImgNodes: true,
    interceptOryProgrammaticSubmit: false,
    identityPasskeyDisplayFallback: undefined,
    mergePasskeyTriggerIntoIdentifier: false,
  },
);

const visibleFlowMessages = computed(() => {
  let raw = props.flow?.ui.messages ?? [];
  const nf = props.messageFilter;
  if (nf) raw = raw.filter((m) => nf(m, { kind: "flow" }));
  if (props.submitting) raw = raw.filter((m) => m.type !== "error");
  return raw;
});

function visibleNodeMessages(node: UiNode, idx: number): UiText[] {
  let raw = node.messages ?? [];
  const nf = props.messageFilter;
  if (nf) raw = raw.filter((m) => nf(m, { kind: "node", node, nodeIdx: idx }));
  if (props.submitting) raw = raw.filter((m) => m.type !== "error");
  return raw;
}

const renderedNodes = computed(() => props.nodes ?? props.flow?.ui.nodes ?? []);

const displayNodes = computed(() =>
  filterOutMergedLoginTriggerButton(
    props.mergePasskeyTriggerIntoIdentifier,
    renderedNodes.value,
  ),
);

/** Present when the passkey/WebAuthn login button is merged into the identifier field. */
const passkeyLoginTriggerNode = computed(() => {
  if (
    !shouldMergePasskeyTriggerIntoIdentifier(
      props.mergePasskeyTriggerIntoIdentifier,
      renderedNodes.value,
    )
  ) {
    return null;
  }
  return findPasskeyOrWebAuthnLoginTrigger(renderedNodes.value);
});

const flowForFocus = computed(() => {
  const f = props.flow;
  if (!f) return null;
  return {
    ui: {
      ...f.ui,
      nodes: displayNodes.value,
    },
  };
});

const formRef = ref<HTMLFormElement | null>(null);

/** When {@link SubmitEvent.submitter} is null (often with Vuetify `v-btn`), `FormData` loses the clicked control. */
const lastPointerSubmitter = ref<HTMLButtonElement | HTMLInputElement | null>(null);

function onFormPointerDownCapture(ev: Event) {
  const t = ev.target;
  if (!(t instanceof Element)) return;
  const el = t.closest("button[type='submit'],input[type='submit']");
  if (el instanceof HTMLButtonElement && el.type === "submit") {
    lastPointerSubmitter.value = el;
    return;
  }
  if (el instanceof HTMLInputElement && el.type === "submit") {
    lastPointerSubmitter.value = el;
  }
}
useKratosFlowFocusAfterUiChange(flowForFocus, formRef);

const { fieldModels, passwordVisible } =
  useKratosFieldModelsForNodes(displayNodes);

useKratosOryWebAuthnScripts(displayNodes);

let unpatchOryFormSubmit: (() => void) | undefined;
watch(
  () => [formRef.value, props.interceptOryProgrammaticSubmit] as const,
  ([form, intercept]) => {
    unpatchOryFormSubmit?.();
    unpatchOryFormSubmit = undefined;
    if (form && intercept) {
      unpatchOryFormSubmit =
        patchKratosFormSubmitForOryProgrammaticSubmit(form);
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  unpatchOryFormSubmit?.();
});

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
  const passkeyRemove = kratosPasskeyRemoveButtonLabel(
    node,
    renderedNodes.value,
    props.identityPasskeyDisplayFallback,
  );
  if (passkeyRemove) return passkeyRemove;
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

/** Cloud key: passkey / password manager (not fingerprint-specific). */
function appendInnerIcon(node: UiNode, idx: number): string | undefined {
  const pwd = appendPasswordIcon(node, idx);
  if (pwd) return pwd;
  if (
    passkeyLoginTriggerNode.value &&
    isKratosInputNode(node) &&
    node.attributes.name === "identifier"
  ) {
    return "mdi-cloud-key";
  }
  return undefined;
}

function identifierPasskeyFieldClass(node: UiNode): string | undefined {
  if (
    passkeyLoginTriggerNode.value &&
    isKratosInputNode(node) &&
    node.attributes.name === "identifier"
  ) {
    return "kratos-flow-form__identifier-with-passkey";
  }
  return undefined;
}

function onAppendInnerClick(idx: number, node: UiNode) {
  if (!isKratosInputNode(node)) return;
  if (kratosEffectiveInputType(node.attributes) === "password") {
    togglePasswordVisibility(idx, node);
    return;
  }
  const trigger = passkeyLoginTriggerNode.value;
  if (trigger && node.attributes.name === "identifier") {
    runKratosWebAuthnInputClick(trigger);
  }
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
  if (!(el instanceof HTMLFormElement)) return;
  const se = ev as SubmitEvent;
  let sub: HTMLElement | null = (se.submitter as HTMLElement | null) ?? null;
  if (!sub && lastPointerSubmitter.value) {
    sub = lastPointerSubmitter.value;
  }
  lastPointerSubmitter.value = null;
  emit("submit", el, sub);
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

/* Passkey trigger uses append-inner icon; emphasize affordance slightly */
.kratos-flow-form__identifier-with-passkey
  :deep(.v-field__append-inner)
  .v-icon {
  opacity: 1;
}
</style>
