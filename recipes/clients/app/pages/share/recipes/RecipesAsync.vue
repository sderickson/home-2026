<template>
  <AsyncPage
    :loader="useRecipesLoader"
    :page-component="Recipes"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useRecipesLoader } from "./Recipes.loader.ts";
import { share_recipes as strings } from "./Recipes.strings.ts";
import { AsyncPage } from "@saflib/vue/components";
import { useAsyncPageDocumentTitle } from "@saflib/vue";

useAsyncPageDocumentTitle(strings.documentTitle);

const Recipes = defineAsyncComponent(
  () => import("./Recipes.vue"),
);
</script>
