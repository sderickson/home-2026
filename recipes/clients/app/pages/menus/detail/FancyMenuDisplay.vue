<template>
  <div
    class="fancy-menu-grid"
    :style="gridStyle"
  >
    <section
      v-for="(grouping, gIndex) in groupings"
      :key="gIndex"
      class="fancy-menu-grouping"
    >
      <h2 class="fancy-menu-section-title">
        {{ grouping.name }}
      </h2>
      <ul class="fancy-menu-dish-list">
        <li
          v-for="recipeId in grouping.recipeIds"
          :key="recipeId"
          class="fancy-menu-dish-item"
        >
          <router-link
            :to="recipeLink(recipeId)"
            class="fancy-menu-dish-link"
          >
            <span class="fancy-menu-dish-name">{{
              recipeById.get(recipeId)?.title ?? recipeId
            }}</span>
            <span
              v-if="subtextByRecipeId.get(recipeId)"
              class="fancy-menu-dish-desc"
            >
              {{ subtextByRecipeId.get(recipeId) }}
            </span>
          </router-link>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";

/** Same breakpoints as recipes/service/sdk/.../RecipeList.vue */
const RECIPE_LIST_BREAKPOINT_SM = 600;
const RECIPE_LIST_BREAKPOINT_MD = 960;
const RECIPE_LIST_BREAKPOINT_LG = 1280;

const props = defineProps<{
  groupings: { name: string; recipeIds: string[] }[];
  recipeById: Map<
    string,
    { id: string; title: string; subtitle?: string }
  >;
  subtextByRecipeId: Map<string, string>;
  recipeLink: (recipeId: string) => string;
}>();

const display = useDisplay();

/** Cap column count at the number of sections (RecipeList caps at 4 by width only). */
const columnCount = computed(() => {
  const sectionCount = props.groupings.length;
  if (sectionCount <= 0) return 1;
  const w = display.width.value;
  let maxByWidth = 1;
  if (w >= RECIPE_LIST_BREAKPOINT_LG) maxByWidth = 4;
  else if (w >= RECIPE_LIST_BREAKPOINT_MD) maxByWidth = 3;
  else if (w >= RECIPE_LIST_BREAKPOINT_SM) maxByWidth = 2;
  return Math.min(maxByWidth, sectionCount);
});

/**
 * CSS multi-column (`column-count`) balances content in ways that can misalign the
 * first column’s top edge. A plain grid with one cell per section keeps section
 * headers aligned horizontally.
 */
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columnCount.value}, minmax(0, 1fr))`,
}));
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap");

.fancy-menu-grid {
  display: grid;
  gap: 1rem 1.5rem;
  align-items: start;
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem 0;
  text-align: center;
  font-family: "Outfit", system-ui, sans-serif;
  color: rgb(var(--v-theme-on-surface));
}

.fancy-menu-grouping {
  min-width: 0;
}

.fancy-menu-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  opacity: 0.92;
}

.fancy-menu-dish-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.fancy-menu-dish-item {
  padding: 0.5rem 0;
}

.fancy-menu-dish-link {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: color 0.15s ease;
}

.fancy-menu-dish-link:hover {
  color: rgb(var(--v-theme-primary));
}

.fancy-menu-dish-name {
  display: block;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.35;
}

.fancy-menu-dish-desc {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.4;
  opacity: 0.8;
}
</style>
