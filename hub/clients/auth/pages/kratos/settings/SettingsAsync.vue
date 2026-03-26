<template>
  <AsyncPage :loader="useSettingsLoader" :page-component="Settings">
    <template #error="{ error, errorMessage }">
      <SettingsFlowAutoRestart v-if="isKratosFlowGoneError(error)" />
      <AsyncPageError v-else :error="error" :message="errorMessage" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { isKratosFlowGoneError } from "@sderickson/recipes-sdk";
import { AsyncPage, AsyncPageError } from "@saflib/vue/components";
import { useSettingsLoader } from "./Settings.loader.ts";
import SettingsFlowAutoRestart from "./SettingsFlowAutoRestart.vue";

const Settings = defineAsyncComponent(() => import("./Settings.vue"));
</script>
