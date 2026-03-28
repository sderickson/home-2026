<template>
  <v-container class="py-8" max-width="720">
    <template v-if="queryData instanceof SettingsFlowFetched && flow">
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

    <SettingsAalReauthRedirect
      v-else-if="queryData instanceof BrowserRedirectRequired"
      :redirect-browser-to="queryData.payload.redirect_browser_to"
    />

    <FlowGonePanel
      v-else-if="queryData instanceof FlowGone"
      restart-path="/new-settings"
      :restart-query="settingsRestartQuery"
      :result="queryData"
    />
    <CsrfViolationPanel
      v-else-if="queryData instanceof SecurityCsrfViolation"
      restart-path="/new-settings"
      :restart-query="settingsRestartQuery"
      :result="queryData"
    />
    <UnhandledResponsePanel v-else :result="queryData" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, toValue, watch } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import type { SettingsFlow } from "@ory/client";
import {
  BrowserRedirectRequired,
  FlowGone,
  getSettingsFlowQueryKey,
  SecurityCsrfViolation,
  SettingsFlowFetched,
} from "@saflib/ory-kratos-sdk";
import KratosSettingsGroupUi from "./KratosSettingsGroupUi.vue";
import SettingsIntro from "./SettingsIntro.vue";
import { settings_tabs as tabs } from "./Settings.strings.ts";
import { useSettingsFlow } from "./useSettingsFlow.ts";
import { useSettingsLoader } from "./Settings.loader.ts";
import CsrfViolationPanel from "../common/CsrfViolationPanel.vue";
import FlowGonePanel from "../common/FlowGonePanel.vue";
import UnhandledResponsePanel from "../common/UnhandledResponsePanel.vue";
import SettingsAalReauthRedirect from "./SettingsAalReauthRedirect.vue";

const { t } = useReverseT();
const route = useRoute();
const queryClient = useQueryClient();
const { getSettingsFlowQuery } = useSettingsLoader();

const queryData = computed(() => toValue(getSettingsFlowQuery.data));

const flow = computed((): SettingsFlow | null => {
  const d = queryData.value;
  if (d instanceof SettingsFlowFetched) {
    return d.flow;
  }
  return null;
});

const flowIdForSubmit = computed(() => flow.value?.id ?? "");

const { submitting, submitError, clearSubmitError, submitSettingsForm } =
  useSettingsFlow(flowIdForSubmit);

const hasTotpSettings = computed(() =>
  Boolean(flow.value?.ui.nodes.some((node) => node.group === "totp")),
);

const tab = ref<"email" | "password" | "totp">("email");

/** Flow-level banners (e.g. “saved”) apply to the whole flow; clear them when switching tabs. */
watch(tab, (_next, prev) => {
  if (prev === undefined) return;
  const id = flowIdForSubmit.value;
  const currentFlow = flow.value;
  if (!id || !currentFlow) return;
  queryClient.setQueryData(
    getSettingsFlowQueryKey(id),
    new SettingsFlowFetched({
      ...currentFlow,
      ui: {
        ...currentFlow.ui,
        messages: [],
      },
    }),
  );
});

/** Preserve `return_to` when restarting from CSRF or expired flow. */
const settingsRestartQuery = computed(() => {
  const q: Record<string, string> = {};
  if (typeof route.query.return_to === "string" && route.query.return_to.trim()) {
    q.return_to = route.query.return_to.trim();
  }
  return q;
});
</script>
