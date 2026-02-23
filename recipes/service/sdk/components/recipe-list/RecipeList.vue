<template>
  <div>
    <h2 class="text-h6 mb-4">{{ t(strings.title) }}</h2>
    <p class="text-medium-emphasis mb-4">{{ t(strings.description) }}</p>

    <v-alert v-if="recipes.length === 0" type="info" variant="tonal" class="mb-4">
      {{ t(strings.empty) }}
    </v-alert>

    <v-card v-else variant="outlined">
      <v-list lines="two">
        <v-list-item
          v-for="recipe in recipes"
          :key="recipe.id"
          v-bind="getRecipeLinkProps(recipe.id)"
          :title="recipe.title"
          :subtitle="recipe.shortDescription"
          prepend-icon="mdi-book-open-page-variant-outline"
          append-icon="mdi-chevron-right"
          link
        />
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from "@sderickson/recipes-spec";
import { recipe_list_strings as strings } from "./RecipeList.strings.ts";
import { useReverseT } from "../../i18n.ts";

const { t } = useReverseT();

defineProps<{
  /** List of recipes to display. Data fetching is handled by the parent. */
  recipes: Recipe[];
  /** Returns link props (to or href) for navigating to the recipe detail page. */
  getRecipeLinkProps: (recipeId: string) => { to?: string; href?: string };
}>();
</script>
