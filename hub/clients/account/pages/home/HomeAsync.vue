<template>
  <AsyncPage
    :loader="useHomeLoader"
    :page-component="Home"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useHomeLoader } from "./Home.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
const Home = defineAsyncComponent(
  () => import("./Home.vue"),
);
</script>
