<template>
  <AsyncPage :loader="useVerificationLoader" :page-component="Verification">
    <template #error="{ error, errorMessage }">
      <VerificationFlowExpired v-if="isKratosFlowGoneError(error)" />
      <AsyncPageError v-else :error="error" :message="errorMessage" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { isKratosFlowGoneError } from "@sderickson/recipes-sdk";
import { AsyncPage, AsyncPageError } from "@saflib/vue/components";
import { useVerificationLoader } from "./Verification.loader.ts";
import VerificationFlowExpired from "./VerificationFlowExpired.vue";

const Verification = defineAsyncComponent(() => import("./Verification.vue"));
</script>
