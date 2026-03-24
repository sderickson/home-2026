<template>
  <AsyncPage
    :loader="useVerificationLoader"
    :page-component="Verification"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useVerificationLoader } from "./Verification.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
const Verification = defineAsyncComponent(
  () => import("./Verification.vue"),
);
</script>
