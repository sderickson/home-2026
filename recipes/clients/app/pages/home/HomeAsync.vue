<template>
  <AsyncPage :loader="useHomeLoader" :page-component="Home">
    <template #error="{ error, errorMessage }">
      <AppHomeError :error="error" :error-message="errorMessage" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useHomeLoader } from "./Home.loader.ts";
import { AsyncPage } from "@saflib/vue/components";
import AppHomeError from "./AppHomeError.vue";

const Home = defineAsyncComponent(async () => {
  console.log("starting code sleep");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("ending code sleep");
  return import("./Home.vue");
});
</script>
