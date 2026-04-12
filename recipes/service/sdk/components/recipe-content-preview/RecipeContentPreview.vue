<template>
  <div class="recipe-content-preview">
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

    <v-row class="ma-0">
      <v-col cols="12" :md="splitIntoTwoColumns ? 6 : 12" class="pa-3 pt-2">
        <div
          v-if="imageFiles.length > 0"
          class="recipe-content-preview__image-row"
        >
          <div
            v-for="file in imageFiles"
            :key="file.id"
            class="recipe-content-preview__image-cell"
          >
            <div
              class="recipe-content-preview__image-wrapper position-relative"
            >
              <v-img
                :src="file.downloadUrl"
                :alt="file.fileOriginalName"
                max-height="300"
                width="100%"
                cover
                class="recipe-content-preview__image-img rounded-lg cursor-pointer"
                @click="$emit('clickImage', file)"
              />
              <v-btn
                v-if="showImageActions"
                icon
                size="tiny"
                color="error"
                variant="flat"
                class="recipe-content-preview__image-delete-btn"
                :disabled="imageDeleteDisabled"
                @click.stop="$emit('deleteImage', file)"
              >
                <v-icon size="tiny">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <template v-if="content.ingredients.length > 0">
          <v-divider v-if="imageFiles.length > 0" class="my-3" />
          <div class="recipe-content-preview__block py-2">
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

        <template v-if="hasInstructions && !splitIntoTwoColumns">
          <v-divider
            v-if="imageFiles.length > 0 || content.ingredients.length > 0"
            class="mt-3"
          />
          <div class="recipe-content-preview__block py-2">
            <h3 class="text-subtitle-1 font-weight-medium mb-2">
              {{ t(strings.instructions) }}
            </h3>
            <div
              class="recipe-content-preview__instructions text-body-2"
              v-html="renderedInstructions"
            />
          </div>
        </template>
      </v-col>

      <v-col
        v-if="splitIntoTwoColumns"
        cols="12"
        md="6"
        class="pa-3 pt-2 recipe-content-preview__instructions-col"
      >
        <div class="recipe-content-preview__block py-2">
          <h3 class="text-subtitle-1 font-weight-medium mb-2">
            {{ t(strings.instructions) }}
          </h3>
          <div
            class="recipe-content-preview__instructions text-body-2"
            v-html="renderedInstructions"
          />
        </div>
      </v-col>
    </v-row>
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

const content = computed(
  () =>
    props.currentVersion?.content ?? {
      ingredients: [],
      instructionsMarkdown: "",
    },
);

const imageFiles = computed(() =>
  (props.files ?? []).filter((f) => (f.mimetype ?? "").startsWith("image/")),
);

const hasInstructions = computed(() => {
  const md = content.value.instructionsMarkdown?.trim() ?? "";
  return md.length > 0;
});

/** md+: images + ingredients (left) | instructions (right), when body warrants a split. */
const splitIntoTwoColumns = computed(
  () =>
    hasInstructions.value &&
    (imageFiles.value.length > 0 || content.value.ingredients.length > 0),
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

.recipe-content-preview__image-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0.75rem;
  width: 100%;
  align-items: stretch;
}

.recipe-content-preview__image-cell {
  flex: 1 1 0;
  min-width: 0;
  max-height: 300px;
}

.recipe-content-preview__image-wrapper {
  position: relative;
  max-height: 300px;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.recipe-content-preview__image-img {
  max-height: 300px;
}

.recipe-content-preview__image-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}

.cursor-pointer {
  cursor: pointer;
}

@media (min-width: 960px) {
  .recipe-content-preview__instructions-col {
    border-inline-start: 1px solid
      rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
