<template>
  <AsyncPage
    :loader="useRecoveryLoader"
    :page-component="Recovery"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useRecoveryLoader } from "./Recovery.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
const Recovery = defineAsyncComponent(
  () => import("./Recovery.vue"),
);
</script>
