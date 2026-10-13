<template>
  <div v-if="recipes.length === 0" class="py-4">
    <v-alert type="info" variant="tonal">
      {{ t(strings.empty) }}
    </v-alert>
  </div>
  <!-- Index-card grid: one column on phones, two from md, three from lg. -->
  <v-row v-else>
    <v-col
      v-for="(recipe, i) in recipes"
      :key="recipe.id"
      cols="12"
      md="6"
      lg="4"
    >
      <RecipeCard
        :recipe="recipe"
        :first-image-url="enrichedByIndex[i]?.firstImageUrl ?? null"
        :key-ingredients="enrichedByIndex[i]?.keyIngredients ?? []"
        :link-props="getRecipeLinkProps(recipe.id)"
      />
    </v-col>
  </v-row>
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
