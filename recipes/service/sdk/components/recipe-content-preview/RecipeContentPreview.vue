<template>
  <v-card variant="outlined" class="recipe-content-preview">
    <v-card-text class="pb-0">
      <h2 v-if="title" class="text-h5 font-weight-bold mb-1">{{ title }}</h2>
      <p
        v-if="shortDescription"
        class="text-medium-emphasis text-body-2 mb-0 mt-0"
        style="line-height: 1.4"
      >
        {{ shortDescription }}
      </p>
      <p
        v-if="longDescription"
        class="text-body-2 mt-3 mb-0 recipe-content-preview__description"
      >
        {{ longDescription }}
      </p>
    </v-card-text>

    <template v-if="content.ingredients.length > 0">
      <v-divider class="mt-3" />
      <v-card-text class="py-2">
        <h3 class="text-subtitle-1 font-weight-medium mb-2">
          {{ t(strings.ingredients) }}
        </h3>
        <ul class="recipe-content-preview__list text-body-2">
          <li
            v-for="(ing, i) in content.ingredients"
            :key="i"
            class="recipe-content-preview__list-item"
          >
            {{ ingredientLine(ing) }}
          </li>
        </ul>
      </v-card-text>
    </template>

    <template v-if="content.instructionsMarkdown">
      <v-divider />
      <v-card-text class="py-2">
        <h3 class="text-subtitle-1 font-weight-medium mb-2">
          {{ t(strings.instructions) }}
        </h3>
        <div
          class="recipe-content-preview__instructions text-body-2"
          v-html="renderedInstructions"
        />
      </v-card-text>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import { recipe_content_preview_strings as strings } from "./RecipeContentPreview.strings.ts";
import { useReverseT } from "../../i18n.ts";

const { t } = useReverseT();

const props = defineProps<{
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  content: {
    ingredients: { name: string; quantity: string; unit: string }[];
    instructionsMarkdown: string;
  };
}>();

function ingredientLine(ing: {
  name: string;
  quantity: string;
  unit: string;
}): string {
  const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean);
  return parts.join(" ").trim() || ing.name;
}

const renderedInstructions = computed(() =>
  props.content.instructionsMarkdown
    ? (marked(props.content.instructionsMarkdown, { async: false }) as string)
    : "",
);
</script>

<style scoped>
.recipe-content-preview__description {
  line-height: 1.6;
  color: rgba(var(--v-theme-on-surface), 0.85);
}

.recipe-content-preview__list,
.recipe-content-preview__list-item {
  line-height: 1.6;
}

/* Hanging indent: markers have their own x space, wraps align with text start */
.recipe-content-preview__list {
  padding-inline-start: 2em;
  margin: 0;
  list-style-position: outside;
}

.recipe-content-preview__list-item {
  margin-bottom: 0.25rem;
}

.recipe-content-preview__list-item:last-child {
  margin-bottom: 0;
}

.recipe-content-preview__instructions :deep(ol) {
  padding-inline-start: 2em;
  margin: 0 0 0.5rem;
  line-height: 1.6;
  list-style-position: outside;
}

.recipe-content-preview__instructions :deep(ol li) {
  margin-bottom: 0.25rem;
}

.recipe-content-preview__instructions :deep(ol li:last-child) {
  margin-bottom: 0;
}

.recipe-content-preview__instructions :deep(p) {
  margin: 0 0 0.5rem;
  line-height: 1.6;
}

.recipe-content-preview__instructions :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
