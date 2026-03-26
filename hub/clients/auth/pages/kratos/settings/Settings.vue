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

    <div
      v-for="(m, i) in flow?.ui.messages ?? []"
      :key="'gm-' + i"
      class="text-body-2 mb-2"
      :class="m.type === 'error' ? 'text-error' : ''"
    >
      {{ m.text }}
    </div>

    <template v-if="flow && flowId">
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
} from "@saflib/ory-kratos-sdk";
import type { SettingsFlow } from "@ory/client";
const { createSettingsFlowQuery, getSettingsFlowQuery } = useSettingsLoader();

const createSettingsResult = createSettingsFlowQuery.data.value;
const getSettingsResult = getSettingsFlowQuery.data.value;
const flow = ref<SettingsFlow | null>(null);

if (createSettingsResult) {
  switch (true) {
    case createSettingsResult instanceof SettingsFlowCreated:
      flow.value = createSettingsResult.flow;
      // update the url with the flow id
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?flow=${flow.value?.id}`,
      );
      break;
    case createSettingsResult instanceof BrowserRedirectRequired:
      if (!createSettingsResult.payload.redirect_browser_to) {
        throw new Error("Redirect browser to is required");
      }
      window.location.href = createSettingsResult.payload.redirect_browser_to;
      break;
    default:
      throw new Error("Unexpected create settings result");
  }
} else if (getSettingsResult) {
  switch (true) {
    case getSettingsResult instanceof SettingsFlowFetched:
      flow.value = getSettingsResult.flow;
      break;
    case getSettingsResult instanceof BrowserRedirectRequired:
      break;
    default:
      throw new Error("Unexpected get settings result");
  }
}

const flowId = computed(() => flow.value?.id ?? "");

const { t } = useReverseT();

const tab = ref<"email" | "password" | "totp">("email");

// const { browserReturnTo, flowIdForForm } = useSettingsRouteSync();

const { submitting, submitError, clearSubmitError, submitSettingsForm } =
  useSettingsFlow(flowId);

const hasTotpSettings = computed(() =>
  Boolean(flow.value?.ui.nodes.some((node) => node.group === "totp")),
);
</script>
