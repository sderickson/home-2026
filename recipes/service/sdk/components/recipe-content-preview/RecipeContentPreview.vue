<template>
  <div class="recipe-content-preview">
    <!-- Images above title (only when present) -->
    <template v-if="imageFiles.length > 0">
      <v-container fluid class="pa-3 pb-0">
        <v-row dense>
          <v-col
            v-for="file in imageFiles"
            :key="file.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <div class="recipe-content-preview__image-wrapper position-relative">
              <v-img
                :src="file.downloadUrl"
                :alt="file.fileOriginalName"
                aspect-ratio="1"
                cover
                class="rounded-lg cursor-pointer"
                @click="$emit('clickImage', file)"
              />
              <v-btn
                v-if="showImageActions"
                icon
                size="small"
                color="error"
                variant="flat"
                class="recipe-content-preview__image-delete-btn"
                :disabled="imageDeleteDisabled"
                @click.stop="$emit('deleteImage', file)"
              >
                <v-icon size="small">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <div class="recipe-content-preview__text pa-3 pb-0">
      <h2 v-if="recipe.title" class="text-h5 font-weight-bold mb-1">
        {{ recipe.title }}
      </h2>
      <p
        v-if="recipe.subtitle"
        class="text-medium-emphasis text-body-2 mb-0 mt-0"
        style="line-height: 1.4"
      >
        {{ recipe.subtitle }}
      </p>
      <p
        v-if="recipe.description"
        class="text-body-2 mt-3 mb-0 recipe-content-preview__description"
      >
        {{ recipe.description }}
      </p>
    </div>

    <template v-if="content.ingredients.length > 0">
      <v-divider class="mt-3" />
      <div class="recipe-content-preview__block pa-3 py-2">
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
      </div>
    </template>

    <template v-if="content.instructionsMarkdown">
      <v-divider />
      <div class="recipe-content-preview__block pa-3 py-2">
        <h3 class="text-subtitle-1 font-weight-medium mb-2">
          {{ t(strings.instructions) }}
        </h3>
        <div
          class="recipe-content-preview__instructions text-body-2"
          v-html="renderedInstructions"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type {
  Recipe,
  RecipeFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import { computed } from "vue";
import { marked } from "marked";
import { recipe_content_preview_strings as strings } from "./RecipeContentPreview.strings.ts";
import { useReverseT } from "../../i18n.ts";

const { t } = useReverseT();

const props = withDefaults(
  defineProps<{
    recipe: Recipe;
    currentVersion?: RecipeVersion | null;
    files?: RecipeFileInfo[];
    showImageActions?: boolean;
    imageDeleteDisabled?: boolean;
  }>(),
  {
    currentVersion: undefined,
    files: () => [],
    showImageActions: false,
    imageDeleteDisabled: false,
  },
);

defineEmits<{
  clickImage: [file: RecipeFileInfo];
  deleteImage: [file: RecipeFileInfo];
}>();

const content = computed(() => props.currentVersion?.content ?? {
  ingredients: [],
  instructionsMarkdown: "",
});

const imageFiles = computed(() =>
  (props.files ?? []).filter((f) => (f.mimetype ?? "").startsWith("image/")),
);

function ingredientLine(ing: {
  name: string;
  quantity: string;
  unit: string;
}): string {
  const parts = [ing.quantity, ing.unit, ing.name].filter(Boolean);
  return parts.join(" ").trim() || ing.name;
}

const renderedInstructions = computed(() =>
  content.value.instructionsMarkdown
    ? (marked(content.value.instructionsMarkdown, { async: false }) as string)
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

.recipe-content-preview__image-wrapper {
  position: relative;
}

.recipe-content-preview__image-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
