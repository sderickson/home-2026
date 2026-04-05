<template>
  <v-card
    v-bind="linkProps"
    variant="outlined"
    class="recipe-card mb-4 overflow-hidden"
    link
  >
    <v-img
      v-if="firstImageUrl"
      :src="firstImageUrl"
      :alt="recipe.title"
      cover
      aspect-ratio="1"
    />
    <v-sheet
      v-else
      color="surface-variant"
      class="d-flex align-center justify-center"
      style="aspect-ratio: 1"
    >
      <v-icon size="48" color="grey-lighten-1">
        mdi-book-open-page-variant-outline
      </v-icon>
    </v-sheet>
    <v-card-title class="text-body-1 font-weight-medium pt-2 pb-1 px-3">
      {{ recipe.title }}
    </v-card-title>
    <v-card-subtitle
      v-if="recipe.subtitle"
      class="px-3 pt-0 pb-1 text-medium-emphasis"
    >
      {{ recipe.subtitle }}
    </v-card-subtitle>
    <v-card-text
      v-if="keyIngredientsDisplay"
      class="text-body-2 text-medium-emphasis pt-0 px-3 pb-3"
    >
      {{ keyIngredientsDisplay }}
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Recipe } from "@sderickson/recipes-spec";
import type { KeyIngredient } from "./RecipeList.logic.ts";
import { formatKeyIngredientsDisplay } from "./RecipeList.logic.ts";

const props = defineProps<{
  recipe: Recipe;
  firstImageUrl?: string | null;
  keyIngredients: KeyIngredient[];
  linkProps: { to?: string; href?: string };
}>();

const keyIngredientsDisplay = computed(() =>
  formatKeyIngredientsDisplay(props.keyIngredients),
);
</script>

<style scoped>
/* Avoid card splitting across masonry columns. */
.recipe-card {
  break-inside: avoid;
}
/* v-card-title defaults to nowrap + ellipsis; allow multi-line titles. */
.recipe-card :deep(.v-card-title) {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  overflow-wrap: break-word;
  word-break: break-word;
}
</style>
