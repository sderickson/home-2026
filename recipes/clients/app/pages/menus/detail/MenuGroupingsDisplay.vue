<template>
  <div>
    <FancyMenuDisplay
      v-if="viewMode === 'menu'"
      :groupings="groupings"
      :recipe-by-id="recipeById"
      :subtext-by-recipe-id="subtextByRecipeId"
      :recipe-link="recipeLink"
      :menu-title="menuTitle"
      :collection-name="collectionName"
    />
    <DinerMenuDisplay
      v-else
      :groupings="groupings"
      :recipe-by-id="recipeById"
      :subtext-by-recipe-id="subtextByRecipeId"
      :enrichment-by-recipe-id="enrichmentByRecipeId"
      :menu-title="menuTitle"
      :recipe-link="recipeLink"
    />
  </div>
</template>

<script setup lang="ts">
import {
  formatKeyIngredientsDisplay,
  getCardEnrichmentsByRecipeId,
} from "@sderickson/recipes-sdk";
import { computed } from "vue";
import type { RecipeFileInfo, RecipeVersion } from "@sderickson/recipes-spec";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import FancyMenuDisplay from "./FancyMenuDisplay.vue";
import DinerMenuDisplay from "./DinerMenuDisplay.vue";

const props = defineProps<{
  groupings: { name: string; recipeIds: string[] }[];
  recipes: { id: string; title: string; subtitle?: string }[];
  /** Current versions for `recipes` (from the menu response), for key ingredients. */
  currentVersions: RecipeVersion[];
  /** Files for `recipes` (from the menu response), for the first image. */
  files: RecipeFileInfo[];
  menuId: string;
  collectionId: string;
  viewMode: "menu" | "diner";
  menuTitle: string;
  collectionName: string;
}>();

const recipeById = computed(() => {
  const map = new Map<
    string,
    { id: string; title: string; subtitle?: string }
  >();
  for (const r of props.recipes) {
    map.set(r.id, { id: r.id, title: r.title, subtitle: r.subtitle ?? "" });
  }
  return map;
});

const enrichmentByRecipeId = computed(() =>
  getCardEnrichmentsByRecipeId(
    props.recipes,
    props.currentVersions,
    props.files,
  ),
);

const subtextByRecipeId = computed(() => {
  const map = new Map<string, string>();
  for (const r of props.recipes) {
    const sub = r.subtitle?.trim();
    if (sub) {
      map.set(r.id, sub);
    } else {
      const enrichment = enrichmentByRecipeId.value.get(r.id);
      const text = enrichment
        ? formatKeyIngredientsDisplay(enrichment.keyIngredients)
        : "";
      if (text) map.set(r.id, text);
    }
  }
  return map;
});

function recipeLink(recipeId: string) {
  return constructPath(appLinks.menuRecipeDetail, {
    params: {
      collectionId: props.collectionId,
      menuId: props.menuId,
      recipeId,
    },
  });
}
</script>
