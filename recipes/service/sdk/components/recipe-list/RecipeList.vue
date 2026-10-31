<template>
  <div v-if="recipes.length === 0" class="py-4">
    <v-alert type="info" variant="tonal">
      {{ t(strings.empty) }}
    </v-alert>
  </div>
  <!-- Index-card grid: one column on phones, two from md, three from lg. -->
  <v-row v-else>
    <v-col
      v-for="recipe in recipes"
      :key="recipe.id"
      cols="12"
      md="6"
      lg="4"
    >
      <RecipeCard
        :recipe="recipe"
        :first-image-url="enrichmentById.get(recipe.id)?.firstImageUrl ?? null"
        :key-ingredients="enrichmentById.get(recipe.id)?.keyIngredients ?? []"
        :link-props="getRecipeLinkProps(recipe.id)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  Recipe,
  RecipeFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import { useReverseT } from "../../i18n.ts";
import { recipe_list_strings as strings } from "./RecipeList.strings.ts";
import RecipeCard from "./RecipeCard.vue";
import { getCardEnrichmentsByRecipeId } from "./RecipeList.logic.ts";

const props = defineProps<{
  /** List of recipes to display. */
  recipes: Recipe[];
  /** Current versions for `recipes` (from the list response), for key ingredients. */
  currentVersions: RecipeVersion[];
  /** Files for `recipes` (from the list response), for the first image. */
  files: RecipeFileInfo[];
  /** Returns link props (to or href) for navigating to the recipe detail page. */
  getRecipeLinkProps: (recipeId: string) => { to?: string; href?: string };
}>();

const { t } = useReverseT();

const enrichmentById = computed(() =>
  getCardEnrichmentsByRecipeId(
    props.recipes,
    props.currentVersions,
    props.files,
  ),
);
</script>
