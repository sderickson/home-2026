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

    <template v-if="flow && flowIdForForm">
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
import { useSettingsRouteSync } from "./useSettingsRouteSync.ts";

const { t } = useReverseT();

const tab = ref<"email" | "password" | "totp">("email");

const { browserReturnTo, flowIdForForm } = useSettingsRouteSync();

const { flow, submitting, submitError, clearSubmitError, submitSettingsForm } = useSettingsFlow(
  () => flowIdForForm.value,
  () => browserReturnTo.value,
);

const hasTotpSettings = computed(() =>
  Boolean(flow.value?.ui.nodes.some((node) => node.group === "totp")),
);
</script>
