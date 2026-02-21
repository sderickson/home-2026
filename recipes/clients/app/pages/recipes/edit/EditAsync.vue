<template>
  <AsyncPage
    :loader="useEditLoader"
    :page-component="Edit"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useEditLoader } from "./Edit.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
const Edit = defineAsyncComponent(
  () => import("./Edit.vue"),
);
</script>
