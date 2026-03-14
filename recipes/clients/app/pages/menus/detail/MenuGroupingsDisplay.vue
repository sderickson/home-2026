<template>
  <div>
    <div class="text-subtitle-1 mb-2">{{ t(strings.groupings_label) }}</div>
    <div
      v-for="(grouping, gIndex) in groupings"
      :key="gIndex"
      class="mb-4"
    >
      <div class="text-h6 mb-2">{{ grouping.name }}</div>
      <v-list density="compact">
        <v-list-item
          v-for="recipeId in grouping.recipeIds"
          :key="recipeId"
          :title="recipeById.get(recipeId)?.title ?? recipeId"
          :subtitle="recipeById.get(recipeId)?.subtitle ?? ''"
        />
      </v-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { menu_groupings_display as strings } from "./MenuGroupingsDisplay.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const props = defineProps<{
  groupings: { name: string; recipeIds: string[] }[];
  recipes: { id: string; title: string; subtitle?: string }[];
}>();

const { t } = useReverseT();

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
</script>
