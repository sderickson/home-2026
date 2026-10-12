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
import {
  filesListRecipesQuery,
  getRecipeQuery,
} from "../../requests/recipes/index.ts";
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
  queries: computed(() => props.recipes.map((r) => getRecipeQuery(r.id))),
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
/* Index-card grid: as many 300px+ columns as fit. */
.recipe-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 22px;
}
</style>
