<template>
  <AsyncPage :loader="useSettingsLoader" :page-component="Settings">
    <template #error="{ error, errorMessage }">
      <SettingsAalReauthRedirect
        v-if="isKratosAalNotSatisfiedError(error)"
        :redirect-browser-to="kratosAalNotSatisfiedRedirectTo(error)"
      />
      <SettingsFlowAutoRestart v-else-if="isKratosFlowGoneError(error)" />
      <AsyncPageError v-else :error="error" :message="errorMessage" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import {
  isKratosAalNotSatisfiedError,
  isKratosFlowGoneError,
  kratosAalNotSatisfiedRedirectTo,
} from "@sderickson/recipes-sdk";
import { AsyncPage, AsyncPageError } from "@saflib/vue/components";
import { useSettingsLoader } from "./Settings.loader.ts";
import SettingsAalReauthRedirect from "./SettingsAalReauthRedirect.vue";
import SettingsFlowAutoRestart from "./SettingsFlowAutoRestart.vue";

const Settings = defineAsyncComponent(() => import("./Settings.vue"));
</script>
