<template>
  <v-card
    v-bind="linkProps"
    class="index-card paper"
    :class="{ 'index-card--photo': !!firstImageUrl }"
    :ripple="false"
    link
  >
    <div class="index-card__head">
      <span class="index-card__title font-title">{{ recipe.title }}</span>
    </div>
    <div class="index-card__body ruled-26">
      <div v-if="recipe.subtitle" class="index-card__line index-card__subtitle">
        {{ recipe.subtitle }}
      </div>
      <div
        v-if="keyIngredientsDisplay"
        class="index-card__line index-card__keys font-mono"
      >
        {{ keyIngredientsDisplay }}
      </div>
    </div>
    <v-img
      v-if="firstImageUrl"
      :src="firstImageUrl"
      :alt="recipe.title"
      cover
      class="index-card__photo photo-print"
    />
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
/* A 5:3 index card: title over a red line, then blue ruled lines. */
.index-card {
  aspect-ratio: 5 / 3;
  color: rgb(var(--v-theme-on-surface));
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.index-card:hover,
.index-card:focus-visible {
  transform: translateY(-3px);
  box-shadow: var(--paper-shadow-raised);
}

/* No grey hover/focus wash: the lift is the hover state. */
.index-card :deep(.v-card__overlay) {
  display: none;
}

.index-card__head {
  height: 58px;
  padding: 0 20px 8px;
  display: flex;
  align-items: flex-end;
  border-bottom: 1.5px solid rgb(var(--v-theme-card-red-line));
}

.index-card__title {
  font-weight: 600;
  font-size: 22px;
  line-height: 1.1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.index-card--photo .index-card__title {
  padding-right: 72px;
}

.index-card__body {
  height: calc(100% - 58px);
  padding: 0 20px;
  overflow: hidden;
}

.index-card__line {
  line-height: var(--rule);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.index-card__subtitle {
  font-size: 15px;
}

.index-card__keys {
  font-size: 13px;
  color: rgb(var(--v-theme-primary));
}

.index-card__photo {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 62px;
  height: 62px;
}
</style>
