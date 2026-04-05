<template>
  <div>
    <FancyMenuDisplay
      v-if="viewMode === 'menu'"
      :groupings="groupings"
      :recipe-by-id="recipeById"
      :subtext-by-recipe-id="subtextByRecipeId"
      :recipe-link="recipeLink"
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
  getCardEnrichment,
  getRecipeQuery,
  filesListRecipesQuery,
} from "@sderickson/recipes-sdk";
import { computed } from "vue";
import { useQueries } from "@tanstack/vue-query";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import FancyMenuDisplay from "./FancyMenuDisplay.vue";
import DinerMenuDisplay from "./DinerMenuDisplay.vue";

const props = defineProps<{
  groupings: { name: string; recipeIds: string[] }[];
  recipes: { id: string; title: string; subtitle?: string }[];
  menuId: string;
  collectionId: string;
  viewMode: "menu" | "diner";
  menuTitle?: string;
}>();

const uniqueRecipeIds = computed(() => {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const g of props.groupings) {
    for (const id of g.recipeIds) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  return ids;
});

const detailQueries = useQueries({
  queries: computed(() =>
    uniqueRecipeIds.value.map((id) => getRecipeQuery(id)),
  ),
});

const filesQueries = useQueries({
  queries: computed(() =>
    uniqueRecipeIds.value.map((id) => filesListRecipesQuery(id)),
  ),
});

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

const enrichmentByRecipeId = computed(() => {
  const map = new Map<
    string,
    {
      firstImageUrl: string | null;
      keyIngredients: {
        name: string;
        quantity: string;
        unit: string;
      }[];
    }
  >();
  uniqueRecipeIds.value.forEach((id, i) => {
    const detail = detailQueries.value[i]?.data;
    const files = filesQueries.value[i]?.data ?? undefined;
    map.set(id, getCardEnrichment(detail, files ?? undefined));
  });
  return map;
});

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
