<template>
  <div class="recipe-content-preview">
    <p v-if="title" class="text-h6">{{ title }}</p>
    <p v-if="shortDescription" class="text-medium-emphasis">{{ shortDescription }}</p>
    <p v-if="longDescription" class="mt-2">{{ longDescription }}</p>
    <template v-if="content.ingredients.length > 0">
      <h3 class="mt-4 text-subtitle-1">{{ t(strings.ingredients) }}</h3>
      <ul>
        <li
          v-for="(ing, i) in content.ingredients"
          :key="i"
        >
          {{ ing.quantity }} {{ ing.unit }} {{ ing.name }}
        </li>
      </ul>
    </template>
    <template v-if="content.instructionsMarkdown">
      <h3 class="mt-4 text-subtitle-1">{{ t(strings.instructions) }}</h3>
      <div
        class="recipe-instructions"
        v-html="renderedInstructions"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import { recipe_content_preview as strings } from "./RecipeContentPreview.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

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

const renderedInstructions = computed(() =>
  props.content.instructionsMarkdown
    ? marked(props.content.instructionsMarkdown, { async: false }) as string
    : "",
);
</script>
