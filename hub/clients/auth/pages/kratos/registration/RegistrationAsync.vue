<template>
  <AsyncPage :loader="useRegistrationLoader" :page-component="Registration">
    <template #error="{ error, errorMessage }">
      <RegistrationFlowExpired v-if="isKratosFlowGoneError(error)" />
      <AsyncPageError v-else :error="error" :message="errorMessage" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { isKratosFlowGoneError } from "@sderickson/recipes-sdk";
import { useRegistrationLoader } from "./Registration.loader.ts";
import { AsyncPage, AsyncPageError } from "@saflib/vue/components";
import RegistrationFlowExpired from "./RegistrationFlowExpired.vue";
const Registration = defineAsyncComponent(
  () => import("./Registration.vue"),
);
</script>
