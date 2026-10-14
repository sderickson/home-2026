<template>
  <v-container fluid class="pa-0 pt-md-4" max-width="1040">
    <v-card class="recipe-card paper">
      <RecipeContentPreview
        :recipe="recipe"
        :current-version="currentVersion"
        :files="files"
        @click-image="expandedImageFile = $event"
      />
    </v-card>

    <ExpandedImageDialog v-model="expandedImageFile" :files="files" />
  </v-container>
</template>

<script setup lang="ts">
import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import { computed, ref } from "vue";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useRecipesLoader } from "./Recipes.loader.ts";
import { assertSharedRecipeLoaded } from "./Recipes.logic.ts";
import ExpandedImageDialog from "./ExpandedImageDialog.vue";

const { sharedRecipeQuery } = useRecipesLoader();

assertSharedRecipeLoaded(sharedRecipeQuery.data.value);

const recipe = computed(() => sharedRecipeQuery.data.value!.recipe);
const currentVersion = computed(
  () => sharedRecipeQuery.data.value!.currentVersion,
);
const files = computed(() => sharedRecipeQuery.data.value!.files);

const expandedImageFile = ref<RecipeFileInfo | null>(null);
</script>

<style scoped>
.recipe-card {
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.05),
    0 8px 24px rgba(0, 0, 0, 0.06);
}
</style>
