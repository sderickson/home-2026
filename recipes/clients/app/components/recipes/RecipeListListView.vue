<template>
  <div class="recipe-rows paper" :class="{ 'recipe-rows--narrow': !mdAndUp }">
    <section
      v-for="group in groups"
      :key="group.letter"
      class="recipe-rows__group"
      :aria-label="group.letter || undefined"
    >
      <!-- Card-catalog gutter: the letter sits beside its first row. -->
      <div class="recipe-rows__letter font-mono text-error" aria-hidden="true">
        {{ group.letter }}
      </div>
      <ul class="recipe-rows__list">
        <li v-for="recipe in group.recipes" :key="recipe.id">
          <router-link
            v-if="getRecipeLinkProps(recipe.id).to"
            :to="getRecipeLinkProps(recipe.id).to!"
            class="recipe-row"
          >
            <RecipeRowContent
              :recipe="recipe"
              :image-url="firstImageUrlById[recipe.id]"
              :key-ingredients="mdAndUp ? keyIngredientsById[recipe.id] : ''"
            />
          </router-link>
          <a
            v-else
            :href="getRecipeLinkProps(recipe.id).href"
            class="recipe-row"
          >
            <RecipeRowContent
              :recipe="recipe"
              :image-url="firstImageUrlById[recipe.id]"
              :key-ingredients="mdAndUp ? keyIngredientsById[recipe.id] : ''"
            />
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from "vue";
import { useDisplay } from "vuetify";
import { VIcon, VImg } from "vuetify/components";
import type {
  Recipe,
  RecipeFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import {
  formatKeyIngredientsDisplay,
  getCardEnrichmentsByRecipeId,
} from "@sderickson/recipes-sdk";
import { groupRecipesByInitial } from "./RecipeListListView.logic.ts";

const props = defineProps<{
  recipes: Recipe[];
  /** Current versions for `recipes` (from the list response), for key ingredients. */
  currentVersions: RecipeVersion[];
  /** Files for `recipes` (from the list response), for the first image. */
  files: RecipeFileInfo[];
  getRecipeLinkProps: (recipeId: string) => { to?: string; href?: string };
  /** Sort alphabetically and group under letter headings. Otherwise one flat list in the given order. */
  grouped?: boolean;
}>();

const { mdAndUp } = useDisplay();

const groups = computed(() =>
  props.grouped
    ? groupRecipesByInitial(props.recipes)
    : [{ letter: "", recipes: props.recipes }],
);

const enrichmentById = computed(() =>
  Object.fromEntries(
    getCardEnrichmentsByRecipeId(
      props.recipes,
      props.currentVersions,
      props.files,
    ),
  ),
);

const firstImageUrlById = computed(() =>
  Object.fromEntries(
    props.recipes.map((r) => [
      r.id,
      enrichmentById.value[r.id]?.firstImageUrl ?? null,
    ]),
  ),
);

const keyIngredientsById = computed(() =>
  Object.fromEntries(
    props.recipes.map((r) => [
      r.id,
      formatKeyIngredientsDisplay(
        enrichmentById.value[r.id]?.keyIngredients ?? [],
      ),
    ]),
  ),
);

/** Photo slot, title + subtitle, key ingredients, chevron. */
const RecipeRowContent = defineComponent({
  props: {
    recipe: { type: Object as () => Recipe, required: true },
    imageUrl: { type: String as () => string | null, default: null },
    keyIngredients: { type: String, default: "" },
  },
  setup(rowProps) {
    return () => [
      rowProps.imageUrl
        ? h(VImg, {
            src: rowProps.imageUrl,
            alt: rowProps.recipe.title,
            cover: true,
            class: "recipe-row__photo photo-print",
          })
        : h("span", { class: "recipe-row__photo-slot", "aria-hidden": "true" }),
      h("span", { class: "recipe-row__text" }, [
        h(
          "span",
          { class: "recipe-row__title font-title" },
          rowProps.recipe.title,
        ),
        rowProps.recipe.subtitle
          ? h(
              "span",
              { class: "recipe-row__sub text-ink-2" },
              rowProps.recipe.subtitle,
            )
          : null,
      ]),
      rowProps.keyIngredients
        ? h(
            "span",
            { class: "recipe-row__keys font-mono text-primary" },
            rowProps.keyIngredients,
          )
        : null,
      h(VIcon, {
        icon: "mdi-chevron-right",
        size: "small",
        class: "recipe-row__chevron text-muted",
      }),
    ];
  },
});
</script>

<style scoped>
/* One sheet of paper: a letter gutter with a red rule, then ruled rows. */
.recipe-rows {
  --gutter: 74px;
  position: relative;
  padding: 8px 0;
  border-radius: 4px;
}

.recipe-rows::before {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: var(--gutter);
  width: 1.5px;
  background: rgb(var(--v-theme-card-red-line));
}

.recipe-rows__group {
  display: flex;
  align-items: flex-start;
}

.recipe-rows__letter {
  flex: 0 0 var(--gutter);
  padding: 26px 0 0 26px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1;
}

.recipe-rows__list {
  flex: 1 1 auto;
  min-width: 0;
  list-style: none;
  margin: 0 0 0 22px;
  padding: 0;
}

.recipe-row {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 84px;
  padding: 12px 24px 12px 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-soft));
  color: rgb(var(--v-theme-on-surface));
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.recipe-row:hover,
.recipe-row:focus-visible {
  background: rgba(var(--v-theme-primary-tint), 0.5);
}

.recipe-row:hover :deep(.recipe-row__title) {
  color: rgb(var(--v-theme-primary));
}

.recipe-rows :deep(.recipe-row__photo),
.recipe-rows :deep(.recipe-row__photo-slot) {
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
}

.recipe-rows :deep(.recipe-row__photo) {
  border-width: 2px;
}

.recipe-rows :deep(.recipe-row__text) {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recipe-rows :deep(.recipe-row__title) {
  font-weight: 600;
  font-size: 20px;
  line-height: 1.2;
  transition: color 0.15s ease;
}

.recipe-rows :deep(.recipe-row__sub) {
  font-size: 15px;
}

/* Key ingredients start at a fixed column so they line up down the sheet. */
.recipe-rows :deep(.recipe-row__keys) {
  flex: 1 1 0;
  min-width: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipe-rows :deep(.recipe-row__chevron) {
  flex: none;
}

/* Phones: narrower gutter, smaller photo, no ingredient column. */
.recipe-rows--narrow {
  --gutter: 40px;
}

.recipe-rows--narrow .recipe-rows__letter {
  padding: 22px 0 0 14px;
  font-size: 15px;
}

.recipe-rows--narrow .recipe-rows__list {
  margin-left: 12px;
}

.recipe-rows--narrow .recipe-row {
  gap: 12px;
  min-height: 68px;
  padding: 8px 12px 8px 0;
}

.recipe-rows--narrow :deep(.recipe-row__photo),
.recipe-rows--narrow :deep(.recipe-row__photo-slot) {
  flex-basis: 44px;
  width: 44px;
  height: 44px;
}

.recipe-rows--narrow :deep(.recipe-row__title) {
  font-size: 18px;
}

.recipe-rows--narrow :deep(.recipe-row__sub) {
  font-size: 14px;
}
</style>
