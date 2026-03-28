<template>
  <KratosFlowUi
    v-if="flow && nodes.length"
    :flow="flow"
    :nodes="nodes"
    :submitting="submitting"
    :id-prefix="idPrefix"
    :message-filter="messageFilter"
    @submit="onSubmit"
  />
  <p v-else-if="flow" class="text-body-2 text-medium-emphasis">
    {{ t(emptyCopy) }}
  </p>
</template>

<script setup lang="ts">
import type { SettingsFlow, UiText } from "@ory/client";
import { computed } from "vue";
import type { KratosFlowUiMessageFilterContext } from "../common/kratosUiMessages.ts";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import KratosFlowUi from "../common/KratosFlowUi.vue";
import { settings_group_empty as strings } from "./Settings.strings.ts";
import { settingsNodesForGroup } from "./Settings.logic.ts";

const props = defineProps<{
  flow: SettingsFlow;
  group: "profile" | "password" | "totp";
  submitting: boolean;
  idPrefix: string;
  messageFilter?: (
    message: UiText,
    context: KratosFlowUiMessageFilterContext,
  ) => boolean;
}>();

const { t } = useReverseT();

const emptyCopy = computed(() =>
  props.group === "profile"
    ? strings.no_profile_fields
    : props.group === "password"
      ? strings.no_password_fields
      : strings.no_totp_fields,
);

const nodes = computed(() => settingsNodesForGroup(props.flow, props.group));

const emit = defineEmits<{
  submit: [form: HTMLFormElement, submitter: HTMLElement | null];
}>();

function onSubmit(form: HTMLFormElement, submitter: HTMLElement | null) {
  emit("submit", form, submitter);
}
</script>
