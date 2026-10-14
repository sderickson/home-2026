<template>
  <AsyncPage :loader="useRecipesLoader" :page-component="Recipes">
    <template #error="{ error }">
      <RecipesError :error="error" />
    </template>
  </AsyncPage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRecipesLoader } from "./Recipes.loader.ts";
import { share_recipes as strings } from "./Recipes.strings.ts";
import { AsyncPage } from "@saflib/vue/components";
import { useAsyncPageDocumentTitle } from "@saflib/vue";
import RecipesError from "./RecipesError.vue";

const loader = useRecipesLoader();

useAsyncPageDocumentTitle(
  strings.documentTitle,
  computed(() => loader.sharedRecipeQuery.data.value?.recipe.title),
);

const Recipes = defineAsyncComponent(() => import("./Recipes.vue"));
</script>
