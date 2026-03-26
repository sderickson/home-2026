<template>
  <AsyncPage :loader="useRecoveryLoader" :page-component="Recovery">
    <template #error="{ error, errorMessage }">
      <RecoveryFlowExpired v-if="isKratosFlowGoneError(error)" />
      <AsyncPageError v-else :error="error" :message="errorMessage" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { isKratosFlowGoneError } from "@sderickson/recipes-sdk";
import { useRecoveryLoader } from "./Recovery.loader.ts";
import { AsyncPage, AsyncPageError } from "@saflib/vue/components";
import RecoveryFlowExpired from "./RecoveryFlowExpired.vue";
const Recovery = defineAsyncComponent(
  () => import("./Recovery.vue"),
);
</script>
