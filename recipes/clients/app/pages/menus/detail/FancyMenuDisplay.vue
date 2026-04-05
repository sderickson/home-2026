<template>
  <div class="fancy-menu-masonry">
    <div
      v-for="(col, cIndex) in masonryColumns"
      :key="cIndex"
      class="fancy-menu-column"
    >
      <section
        v-for="gIndex in col"
        :key="gIndex"
        class="fancy-menu-grouping"
      >
        <h2 class="fancy-menu-section-title">
          {{ groupings[gIndex].name }}
        </h2>
        <ul class="fancy-menu-dish-list">
          <li
            v-for="recipeId in groupings[gIndex].recipeIds"
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
 * Rough px height for greedy placement (header + lines). CSS `column-fill: balance`
 * does not apply when multicol height is `auto`, so we place sections explicitly.
 */
function estimateSectionHeight(g: { recipeIds: string[] }): number {
  return 56 + g.recipeIds.length * 44;
}

/**
 * Assign each section to the column with the smallest running estimated height
 * so later sections stack under shorter columns (masonry-style).
 */
function assignGroupingsToColumns(
  groupings: { recipeIds: string[] }[],
  numCols: number,
): number[][] {
  if (groupings.length === 0) return [];
  if (numCols <= 1) return [groupings.map((_, i) => i)];

  const cols: number[][] = Array.from({ length: numCols }, () => []);
  const heights = new Array(numCols).fill(0);

  for (let i = 0; i < groupings.length; i++) {
    const g = groupings[i];
    let bestCol = 0;
    let bestH = heights[0];
    for (let c = 1; c < numCols; c++) {
      if (heights[c] < bestH) {
        bestH = heights[c];
        bestCol = c;
      }
    }
    cols[bestCol].push(i);
    heights[bestCol] += estimateSectionHeight(g);
  }
  return cols;
}

const masonryColumns = computed(() =>
  assignGroupingsToColumns(props.groupings, columnCount.value),
);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap");

.fancy-menu-masonry {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem 0;
  text-align: center;
  font-family: "Outfit", system-ui, sans-serif;
  color: rgb(var(--v-theme-on-surface));
}

.fancy-menu-column {
  flex: 1 1 0;
  min-width: 0;
}

.fancy-menu-grouping {
  margin-bottom: 1rem;
}

.fancy-menu-grouping:last-child {
  margin-bottom: 0;
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
