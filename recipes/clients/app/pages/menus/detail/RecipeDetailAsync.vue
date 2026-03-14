<template>
  <AsyncPage
    :loader="useMenuRecipeDetailLoader"
    :page-component="RecipeDetail"
  />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { AsyncPage } from "@saflib/vue/components";
import { useMenuRecipeDetailLoader } from "./RecipeDetail.loader.ts";

const RecipeDetail = defineAsyncComponent(() => import("./RecipeDetail.vue"));
</script>
