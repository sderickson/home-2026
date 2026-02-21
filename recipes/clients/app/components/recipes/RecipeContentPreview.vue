<template>
  <v-card variant="outlined">
    <v-card-title v-if="title" class="text-h5">{{ title }}</v-card-title>
    <v-card-subtitle v-if="shortDescription" class="text-medium-emphasis">
      {{ shortDescription }}
    </v-card-subtitle>
    <v-card-text v-if="longDescription" class="text-body-2 pt-0">
      {{ longDescription }}
    </v-card-text>

    <template v-if="content.ingredients.length > 0">
      <v-divider />
      <v-card-title class="text-subtitle-1 font-weight-medium">
        {{ t(strings.ingredients) }}
      </v-card-title>
      <v-list density="compact" class="pt-0">
        <v-list-item
          v-for="(ing, i) in content.ingredients"
          :key="i"
          :title="ingredientLine(ing)"
          class="text-body-2"
        />
      </v-list>
    </template>

    <template v-if="content.instructionsMarkdown">
      <v-divider />
      <v-card-title class="text-subtitle-1 font-weight-medium">
        {{ t(strings.instructions) }}
      </v-card-title>
      <v-card-text class="pt-0 text-body-2">
        <div v-html="renderedInstructions" />
      </v-card-text>
    </template>
  </v-card>
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
