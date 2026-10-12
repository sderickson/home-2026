<template>
  <div class="recipe-rows">
    <section
      v-for="group in groups"
      :key="group.letter"
      :aria-label="group.letter || undefined"
    >
      <div
        v-if="group.letter"
        class="recipe-rows__letter font-mono text-error"
        aria-hidden="true"
      >
        {{ group.letter }}
      </div>
      <ul class="recipe-rows__list">
        <li v-for="recipe in group.recipes" :key="recipe.id">
          <v-card
            v-bind="getRecipeLinkProps(recipe.id)"
            class="recipe-row paper"
            link
          >
            <span class="recipe-row__text">
              <span class="recipe-row__title font-title">
                {{ recipe.title }}
              </span>
              <span v-if="recipe.subtitle" class="recipe-row__sub text-ink-2">
                {{ recipe.subtitle }}
              </span>
            </span>
            <v-img
              v-if="firstImageUrlById[recipe.id]"
              :src="firstImageUrlById[recipe.id] ?? ''"
              :alt="recipe.title"
              cover
              class="recipe-row__photo photo-print"
            />
          </v-card>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQueries } from "@tanstack/vue-query";
import type { Recipe } from "@sderickson/recipes-spec";
import {
  filesListRecipesQuery,
  getCardEnrichment,
} from "@sderickson/recipes-sdk";
import { groupRecipesByInitial } from "./RecipeListListView.logic.ts";

const props = defineProps<{
  recipes: Recipe[];
  getRecipeLinkProps: (recipeId: string) => { to?: string; href?: string };
  /** Sort alphabetically and group under letter headings. Otherwise one flat list in the given order. */
  grouped?: boolean;
}>();

const groups = computed(() =>
  props.grouped
    ? groupRecipesByInitial(props.recipes)
    : [{ letter: "", recipes: props.recipes }],
);

const filesQueries = useQueries({
  queries: computed(() =>
    props.recipes.map((r) => filesListRecipesQuery(r.id)),
  ),
});

const firstImageUrlById = computed(() =>
  Object.fromEntries(
    props.recipes.map((r, i) => [
      r.id,
      getCardEnrichment(undefined, filesQueries.value[i]?.data ?? undefined)
        .firstImageUrl,
    ]),
  ),
);
</script>

<style scoped>
.recipe-rows__letter {
  padding: 14px 6px 6px;
  font-size: 13px;
  font-weight: 500;
}

.recipe-rows__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Compact row: white with the index card's red line along the top. */
.recipe-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 10px 14px;
  border-top: 2px solid rgb(var(--v-theme-card-red-line));
  color: rgb(var(--v-theme-on-surface));
}

.recipe-row__text {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recipe-row__title {
  font-weight: 600;
  font-size: 19px;
  line-height: 1.2;
}

.recipe-row__sub {
  font-size: 14px;
}

.recipe-row__photo {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-width: 2px;
}
</style>
