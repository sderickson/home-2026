<template>
  <v-list class="recipe-list-lines border rounded-lg" density="comfortable">
    <v-list-item
      v-for="(recipe, i) in recipes"
      :key="recipe.id"
      v-bind="getRecipeLinkProps(recipe.id)"
      class="recipe-list-lines-item"
      lines="two"
    >
      <template #prepend>
        <v-avatar rounded="lg" size="72" class="recipe-list-lines-avatar">
          <v-img
            v-if="enrichedByIndex[i]?.firstImageUrl"
            :src="enrichedByIndex[i]?.firstImageUrl ?? ''"
            :alt="recipe.title"
            cover
          />
          <v-sheet
            v-else
            color="surface-variant"
            class="d-flex align-center justify-center fill-height"
          >
            <v-icon size="36" color="grey-lighten-1">
              mdi-book-open-page-variant-outline
            </v-icon>
          </v-sheet>
        </v-avatar>
      </template>
      <v-list-item-title class="text-wrap text-body-1 font-weight-medium">
        {{ recipe.title }}
      </v-list-item-title>
      <v-list-item-subtitle
        v-if="keyIngredientsDisplayByIndex[i]"
        class="text-wrap text-body-2 mt-1 text-medium-emphasis"
      >
        {{ keyIngredientsDisplayByIndex[i] }}
      </v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQueries } from "@tanstack/vue-query";
import type { Recipe } from "@sderickson/recipes-spec";
import {
  filesListRecipesQuery,
  formatKeyIngredientsDisplay,
  getCardEnrichment,
  getRecipeQuery,
} from "@sderickson/recipes-sdk";

const props = defineProps<{
  recipes: Recipe[];
  getRecipeLinkProps: (recipeId: string) => { to?: string; href?: string };
}>();

const detailQueries = useQueries({
  queries: computed(() =>
    props.recipes.map((r) => getRecipeQuery(r.id)),
  ),
});

const filesQueries = useQueries({
  queries: computed(() =>
    props.recipes.map((r) => filesListRecipesQuery(r.id)),
  ),
});

const enrichedByIndex = computed(() =>
  props.recipes.map((_, i) => {
    const detail = detailQueries.value[i]?.data;
    const files = filesQueries.value[i]?.data;
    return getCardEnrichment(detail, files ?? undefined);
  }),
);

/** Same as RecipeCard: key ingredients only, comma-separated name stubs, no amounts. */
const keyIngredientsDisplayByIndex = computed(() =>
  props.recipes.map((_, i) =>
    formatKeyIngredientsDisplay(
      enrichedByIndex.value[i]?.keyIngredients ?? [],
    ),
  ),
);
</script>

<style scoped>
.recipe-list-lines-avatar {
  flex-shrink: 0;
}
.recipe-list-lines-item :deep(.v-list-item__spacer) {
  width: 16px;
}
</style>
