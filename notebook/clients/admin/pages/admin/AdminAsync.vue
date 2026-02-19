<template>
  <AsyncPage
    :loader="useAdminLoader"
    :page-component="Admin"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useAdminLoader } from "./Admin.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
const Admin = defineAsyncComponent(
  () => import("./Admin.vue"),
);
</script>
