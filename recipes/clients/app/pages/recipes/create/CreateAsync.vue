<template>
  <AsyncPage
    :loader="useCreateLoader"
    :page-component="Create"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useCreateLoader } from "./Create.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
const Create = defineAsyncComponent(
  () => import("./Create.vue"),
);
</script>
