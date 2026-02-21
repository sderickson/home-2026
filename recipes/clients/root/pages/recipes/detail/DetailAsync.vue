<template>
  <AsyncPage
    :loader="useDetailLoader"
    :page-component="Detail"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useDetailLoader } from "./Detail.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
const Detail = defineAsyncComponent(
  () => import("./Detail.vue"),
);
</script>
