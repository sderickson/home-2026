<template>
  <v-card>
    <v-card-title>
      {{ recipe.title }}
    </v-card-title>

    <v-card-text>
      <p class="text-medium-emphasis">
        {{ recipe.shortDescription }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Recipe, RecipeVersion } from "@sderickson/recipes-spec";

defineProps<{
  /** Recipe metadata (and optionally current version id from list responses). */
  recipe: Recipe;
  /** Optional current version for display (e.g. ingredient count). */
  currentVersion?: RecipeVersion | null;
}>();
</script>
