<template>
  <div v-if="recipes.length === 0" class="py-4">
    <v-alert type="info" variant="tonal">
      {{ t(strings.empty) }}
    </v-alert>
  </div>
  <div v-else class="recipe-list-grid">
    <RecipeCard
      v-for="(recipe, i) in recipes"
      :key="recipe.id"
      :recipe="recipe"
      :first-image-url="enrichedByIndex[i]?.firstImageUrl ?? null"
      :key-ingredients="enrichedByIndex[i]?.keyIngredients ?? []"
      :link-props="getRecipeLinkProps(recipe.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQueries } from "@tanstack/vue-query";
import type { Recipe } from "@sderickson/recipes-spec";
import { filesListRecipesQuery, getRecipeQuery } from "../../requests/recipes/index.ts";
import { useReverseT } from "../../i18n.ts";
import { recipe_list_strings as strings } from "./RecipeList.strings.ts";
import RecipeCard from "./RecipeCard.vue";
import { getCardEnrichment } from "./RecipeList.logic.ts";

const props = defineProps<{
  /** List of recipes to display. Detail and files are fetched by this component. */
  recipes: Recipe[];
  /** Returns link props (to or href) for navigating to the recipe detail page. */
  getRecipeLinkProps: (recipeId: string) => { to?: string; href?: string };
}>();

const { t } = useReverseT();

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

/** Enrichment per recipe index (first image + key ingredients). */
const enrichedByIndex = computed(() =>
  props.recipes.map((_, i) => {
    const detail = detailQueries.value[i]?.data;
    const files = filesQueries.value[i]?.data;
    return getCardEnrichment(detail, files ?? undefined);
  }),
);
</script>

<style scoped>
/* Masonry layout: Pinterest-style flowing columns (no rigid grid). */
.recipe-list-grid {
  column-count: 1;
  column-gap: 1rem;
}

@media (min-width: 600px) {
  .recipe-list-grid {
    column-count: 2;
  }
}

@media (min-width: 960px) {
  .recipe-list-grid {
    column-count: 3;
  }
}

@media (min-width: 1280px) {
  .recipe-list-grid {
    column-count: 4;
  }
}
</style>
