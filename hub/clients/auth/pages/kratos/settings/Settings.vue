<template>
  <v-container class="py-8" max-width="720">
    <SettingsIntro />

    <v-alert
      v-if="submitError"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="clearSubmitError"
    >
      {{ submitError }}
    </v-alert>

    <SettingsAalReauthRedirect
      v-if="settingsResult instanceof BrowserRedirectRequired"
      :redirect-browser-to="settingsResult.payload.redirect_browser_to"
    />

    <SettingsFlowAutoRestart v-else-if="settingsResult instanceof FlowGone" />

    <template v-else-if="flow && flowId">
      <v-tabs v-model="tab" class="mb-4" color="primary">
        <v-tab value="email">{{ t(tabs.email) }}</v-tab>
        <v-tab value="password">{{ t(tabs.password) }}</v-tab>
        <v-tab v-if="hasTotpSettings" value="totp">{{ t(tabs.totp) }}</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="email">
          <KratosSettingsGroupUi
            :flow="flow"
            group="profile"
            :submitting="submitting"
            id-prefix="settings-profile"
            @submit="(form, submitter) => submitSettingsForm(form, submitter)"
          />
        </v-window-item>
        <v-window-item value="password">
          <KratosSettingsGroupUi
            :flow="flow"
            group="password"
            :submitting="submitting"
            id-prefix="settings-password"
            @submit="(form, submitter) => submitSettingsForm(form, submitter)"
          />
        </v-window-item>
        <v-window-item v-if="hasTotpSettings" value="totp">
          <KratosSettingsGroupUi
            :flow="flow"
            group="totp"
            :submitting="submitting"
            id-prefix="settings-totp"
            @submit="(form, submitter) => submitSettingsForm(form, submitter)"
          />
        </v-window-item>
      </v-window>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import KratosSettingsGroupUi from "./KratosSettingsGroupUi.vue";
import SettingsIntro from "./SettingsIntro.vue";
import { settings_tabs as tabs } from "./Settings.strings.ts";
import { useSettingsFlow } from "./useSettingsFlow.ts";
import { useSettingsLoader } from "./Settings.loader.ts";
import {
  BrowserRedirectRequired,
  SettingsFlowCreated,
  SettingsFlowFetched,
  FlowGone,
} from "@saflib/ory-kratos-sdk";
import type { SettingsFlow } from "@ory/client";
import SettingsAalReauthRedirect from "./SettingsAalReauthRedirect.vue";
import SettingsFlowAutoRestart from "./SettingsFlowAutoRestart.vue";
const { createSettingsFlowQuery, getSettingsFlowQuery } = useSettingsLoader();

const createSettingsResult = createSettingsFlowQuery.data.value;
const getSettingsResult = getSettingsFlowQuery.data.value;
const settingsResult = computed(
  () => createSettingsResult ?? getSettingsResult,
);
const flow = ref<SettingsFlow | null>(null);

switch (true) {
  case settingsResult.value instanceof SettingsFlowCreated:
    flow.value = settingsResult.value.flow;
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?flow=${flow.value?.id}`,
    );
    break;
  case settingsResult.value instanceof SettingsFlowFetched:
    flow.value = settingsResult.value.flow;
    break;
}
const flowId = computed(() => flow.value?.id ?? "");

const { t } = useReverseT();

const tab = ref<"email" | "password" | "totp">("email");

const { submitting, submitError, clearSubmitError, submitSettingsForm } =
  useSettingsFlow(flowId);

const hasTotpSettings = computed(() =>
  Boolean(flow.value?.ui.nodes.some((node) => node.group === "totp")),
);
</script>
