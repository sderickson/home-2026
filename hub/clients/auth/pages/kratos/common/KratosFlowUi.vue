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
        <template v-if="!useMfaGroupTabs">
          <KratosFlowUiNodeAt
            v-for="idx in allNodeIndices"
            :key="'node-' + idx"
            :idx="idx"
          />
        </template>
        <template v-else>
          <KratosFlowUiNodeAt
            v-for="idx in defaultNodeIndices"
            :key="'node-def-' + idx"
            :idx="idx"
          />
          <v-tabs
            v-model="mfaTab"
            color="primary"
            density="comfortable"
            class="mb-1"
          >
            <v-tab v-for="g in nonDefaultGroupsInOrder" :key="g.key">
              {{ groupTabTitle(g.key) }}
            </v-tab>
          </v-tabs>
          <v-window v-model="mfaTab">
            <v-window-item
              v-for="g in nonDefaultGroupsInOrder"
              :key="'win-' + g.key"
            >
              <KratosFlowUiNodeAt
                v-for="idx in g.indices"
                :key="'node-tab-' + idx"
                :idx="idx"
              />
            </v-window-item>
          </v-window>
        </template>
      </fieldset>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import type { UiContainer, UiNode, UiText } from "@ory/client";
import { computed, onBeforeUnmount, provide, ref, watch } from "vue";
import KratosFlowUiNodeAt from "./KratosFlowUiNodeAt.vue";
import {
  KRATOS_FLOW_UI_INJECT,
  type KratosFlowUiInject,
} from "./kratosFlowUiInject.ts";
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
} from "./kratosNodeUtils.ts";

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
    /**
     * Login AAL2: when multiple non-`default` UI groups are present (e.g. `code` + `totp`), render
     * them under Vuetify tabs instead of stacking in one column.
     */
    splitLoginSecondFactorGroupsIntoTabs?: boolean;
    /** Tab labels for {@link splitLoginSecondFactorGroupsIntoTabs}; defaults to titled group keys. */
    resolveGroupTabLabel?: (group: string) => string;
  }>(),
  {
    idPrefix: "kratos-flow",
    hideSubmitNames: () => [],
    interceptOryProgrammaticSubmit: false,
    identityPasskeyDisplayFallback: undefined,
    mergePasskeyTriggerIntoIdentifier: false,
    splitLoginSecondFactorGroupsIntoTabs: false,
    resolveGroupTabLabel: undefined,
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

const nonDefaultGroupsInOrder = computed(() => {
  const nodes = displayNodes.value;
  const order: string[] = [];
  const seen = new Set<string>();
  const map = new Map<string, number[]>();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]!;
    const g = n.group ?? "default";
    if (g === "default") continue;
    if (!seen.has(g)) {
      seen.add(g);
      order.push(g);
      map.set(g, []);
    }
    map.get(g)!.push(i);
  }
  return order.map((key) => ({ key, indices: map.get(key)! }));
});

const defaultNodeIndices = computed(() => {
  const nodes = displayNodes.value;
  const out: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    if ((nodes[i]!.group ?? "default") === "default") out.push(i);
  }
  return out;
});

const allNodeIndices = computed(() => displayNodes.value.map((_, i) => i));

const useMfaGroupTabs = computed(
  () =>
    props.splitLoginSecondFactorGroupsIntoTabs &&
    nonDefaultGroupsInOrder.value.length > 1,
);

const mfaTab = ref(0);

const flowId = computed(() => {
  const f = props.flow as { id?: string } | null | undefined;
  return f?.id ?? "";
});

watch(flowId, () => {
  mfaTab.value = 0;
});

function groupTabTitle(group: string): string {
  if (props.resolveGroupTabLabel) return props.resolveGroupTabLabel(group);
  const fallback: Record<string, string> = {
    code: "Email code",
    totp: "Authenticator app",
    webauthn: "Security key",
    passkey: "Passkey",
    lookup_secret: "Backup codes",
  };
  return fallback[group] ?? group.replace(/_/g, " ");
}

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

provide(KRATOS_FLOW_UI_INJECT, {
  displayNodes,
  renderedNodes,
  submitting: computed(() => props.submitting),
  idPrefix: prefix,
  fieldModels,
  passwordVisible,
  passkeyLoginTriggerNode,
  identityPasskeyDisplayFallback: computed(
    () => props.identityPasskeyDisplayFallback,
  ),
  visibleNodeMessages,
  shouldHideSubmit,
  kratosSubmitLabel,
  prependIcon,
  effectiveInputType,
  appendInnerIcon,
  identifierPasskeyFieldClass,
  onAppendInnerClick,
  elementId,
} satisfies KratosFlowUiInject);

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
