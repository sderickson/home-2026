<template>
  <v-card
    v-bind="linkProps"
    variant="outlined"
    class="recipe-card overflow-hidden"
    link
  >
    <div class="recipe-card__image-wrap">
      <v-img
        v-if="firstImageUrl"
        :src="firstImageUrl"
        :alt="recipe.title"
        cover
        aspect-ratio="1"
        class="recipe-card__image"
      />
      <div
        v-else
        class="recipe-card__image recipe-card__image-placeholder d-flex align-center justify-center"
      >
        <v-icon size="48" color="grey-lighten-1">mdi-book-open-page-variant-outline</v-icon>
      </div>
    </div>
    <v-card-title class="text-body-1 font-weight-medium pt-2 pb-1 px-3">
      {{ recipe.title }}
    </v-card-title>
    <v-card-subtitle v-if="recipe.subtitle" class="px-3 pt-0 pb-1 text-medium-emphasis">
      {{ recipe.subtitle }}
    </v-card-subtitle>
    <ul
      v-if="keyIngredients.length > 0"
      class="recipe-card__ingredients text-body-2 text-medium-emphasis px-3 pb-3 pt-0"
    >
      <li
        v-for="(ing, i) in keyIngredients"
        :key="i"
        class="recipe-card__ingredient"
      >
        {{ ingredientLine(ing) }}
      </li>
    </ul>
  </v-card>
</template>

<script setup lang="ts">
import type { Recipe } from "@sderickson/recipes-spec";
import type { KeyIngredient } from "./RecipeList.logic.ts";

defineProps<{
  recipe: Recipe;
  firstImageUrl?: string | null;
  keyIngredients: KeyIngredient[];
  linkProps: { to?: string; href?: string };
}>();

function ingredientLine(ing: KeyIngredient): string {
  const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean);
  return parts.join(" ").trim() || ing.name;
}
</script>

<style scoped>
.recipe-card {
  break-inside: avoid;
  margin-bottom: 1rem;
}

.recipe-card__image-wrap {
  position: relative;
  overflow: hidden;
}

.recipe-card__image {
  display: block;
  width: 100%;
}

.recipe-card__image-placeholder {
  aspect-ratio: 1;
  background: rgb(var(--v-theme-surface-variant), 0.3);
}

.recipe-card__ingredients {
  list-style: none;
  padding-left: 0;
  margin: 0;
  line-height: 1.4;
}

.recipe-card__ingredient {
  margin-bottom: 0.15rem;
}

.recipe-card__ingredient:last-child {
  margin-bottom: 0;
}
</style>
