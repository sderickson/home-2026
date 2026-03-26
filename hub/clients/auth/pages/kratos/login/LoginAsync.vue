<template>
  <AsyncPage :loader="useLoginLoader" :page-component="Login">
    <template #error="{ error, errorMessage }">
      <LoginFlowExpired v-if="isKratosFlowGoneError(error)" />
      <AsyncPageError v-else :error="error" :message="errorMessage" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { isKratosFlowGoneError } from "@sderickson/recipes-sdk";
import { useLoginLoader } from "./Login.loader.ts";
import { AsyncPage, AsyncPageError } from "@saflib/vue/components";
import LoginFlowExpired from "./LoginFlowExpired.vue";
const Login = defineAsyncComponent(
  () => import("./Login.vue"),
);
</script>
