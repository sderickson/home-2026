<template>
  <AsyncPage
    :loader="useListLoader"
    :page-component="List"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useListLoader } from "./List.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
const List = defineAsyncComponent(
  () => import("./List.vue"),
);
</script>
