<template>
  <article class="fancy-menu paper" :class="{ 'fancy-menu--narrow': !smAndUp }">
    <div class="fancy-menu__frame">
      <header class="fancy-menu__head">
        <p class="fancy-menu__eyebrow font-mono">{{ collectionName }}</p>
        <h1 class="fancy-menu__title font-title">{{ menuTitle }}</h1>
        <div class="fancy-menu__flourish" aria-hidden="true">
          <span class="fancy-menu__flourish-line" />
          <span class="fancy-menu__flourish-diamond" />
          <span class="fancy-menu__flourish-line" />
        </div>
      </header>

      <div class="fancy-menu__columns">
        <div
          v-for="(col, cIndex) in masonryColumns"
          :key="cIndex"
          class="fancy-menu__column"
        >
          <section
            v-for="gIndex in col"
            :key="gIndex"
            class="fancy-menu__section"
          >
            <h2 class="fancy-menu__section-title font-mono">
              {{ groupings[gIndex].name }}
            </h2>
            <ul class="fancy-menu__dishes">
              <li v-for="recipeId in groupings[gIndex].recipeIds" :key="recipeId">
                <router-link :to="recipeLink(recipeId)" class="fancy-menu__dish">
                  <span class="fancy-menu__dish-name font-title">
                    {{ recipeById.get(recipeId)?.title ?? recipeId }}
                  </span>
                  <span
                    v-if="subtextByRecipeId.get(recipeId)"
                    class="fancy-menu__dish-desc text-ink-2"
                  >
                    {{ subtextByRecipeId.get(recipeId) }}
                  </span>
                </router-link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";

const props = defineProps<{
  groupings: { name: string; recipeIds: string[] }[];
  recipeById: Map<string, { id: string; title: string; subtitle?: string }>;
  subtextByRecipeId: Map<string, string>;
  recipeLink: (recipeId: string) => string;
  menuTitle: string;
  collectionName: string;
}>();

const { mdAndUp, smAndUp } = useDisplay();

/** Columns by Vuetify breakpoint, capped at the number of sections. */
const columnCount = computed(() => {
  const sectionCount = props.groupings.length;
  if (sectionCount <= 0) return 1;
  let maxByWidth = 1;
  if (mdAndUp.value) maxByWidth = 3;
  else if (smAndUp.value) maxByWidth = 2;
  return Math.min(maxByWidth, sectionCount);
});

/**
 * Rough px height for greedy placement (header + dishes). CSS `column-fill: balance`
 * does not apply when multicol height is `auto`, so we place sections explicitly.
 */
function estimateSectionHeight(g: { recipeIds: string[] }): number {
  return 64 + g.recipeIds.length * 70;
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
/* A printed menu: white paper with a thin double red frame inset from the edge. */
.fancy-menu {
  padding: 18px;
  border-radius: 4px;
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
}

.fancy-menu__frame {
  padding: 48px 40px 44px;
  border: 1px solid rgb(var(--v-theme-card-red-line));
  outline: 1px solid rgb(var(--v-theme-card-red-line));
  outline-offset: -5px;
}

.fancy-menu__eyebrow {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-ink-2));
}

.fancy-menu__title {
  margin: 6px 0 0;
  font-weight: 600;
  font-size: 56px;
  line-height: 1.1;
  overflow-wrap: break-word;
}

.fancy-menu__flourish {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 14px 0 44px;
}

.fancy-menu__flourish-line {
  width: 68px;
  height: 1px;
  background: rgb(var(--v-theme-card-red-line));
}

.fancy-menu__flourish-diamond {
  width: 7px;
  height: 7px;
  background: rgb(var(--v-theme-card-red-line));
  transform: rotate(45deg);
}

.fancy-menu__columns {
  display: flex;
  align-items: flex-start;
  gap: 42px;
}

.fancy-menu__column {
  flex: 1 1 0;
  min-width: 0;
}

.fancy-menu__section + .fancy-menu__section {
  margin-top: 36px;
}

.fancy-menu__section-title {
  margin: 0 0 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-soft));
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-error));
}

.fancy-menu__dishes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.fancy-menu__dish {
  display: block;
  color: inherit;
  text-decoration: none;
}

.fancy-menu__dish:hover .fancy-menu__dish-name,
.fancy-menu__dish:focus-visible .fancy-menu__dish-name {
  color: rgb(var(--v-theme-primary));
}

.fancy-menu__dish-name {
  display: block;
  font-weight: 600;
  font-size: 22px;
  line-height: 1.2;
  transition: color 0.15s ease;
}

.fancy-menu__dish-desc {
  display: block;
  margin-top: 2px;
  font-size: 15px;
  line-height: 1.4;
}

/* Phones: one column, tighter frame and type. */
.fancy-menu--narrow {
  padding: 10px;
}

.fancy-menu--narrow .fancy-menu__frame {
  padding: 28px 16px 32px;
}

.fancy-menu--narrow .fancy-menu__eyebrow {
  font-size: 12px;
}

.fancy-menu--narrow .fancy-menu__title {
  font-size: 34px;
}

.fancy-menu--narrow .fancy-menu__flourish {
  margin: 10px 0 28px;
}

.fancy-menu--narrow .fancy-menu__section + .fancy-menu__section {
  margin-top: 28px;
}

.fancy-menu--narrow .fancy-menu__section-title {
  margin-bottom: 14px;
  padding-bottom: 10px;
  font-size: 13px;
}

.fancy-menu--narrow .fancy-menu__dishes {
  gap: 14px;
}

.fancy-menu--narrow .fancy-menu__dish-name {
  font-size: 20px;
}
</style>
