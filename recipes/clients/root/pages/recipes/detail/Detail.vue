<template>
  <v-container>
    <v-btn
      :to="rootLinks.recipesList.path"
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
    >
      {{ t(strings.back_to_list) }}
    </v-btn>

    <RecipePreview
      :recipe="recipe"
      :current-version="currentVersion"
    />

    <v-card v-if="recipe.longDescription" variant="outlined" class="mt-4">
      <v-card-text class="text-body-2">
        {{ recipe.longDescription }}
      </v-card-text>
    </v-card>

    <template v-if="content.ingredients.length > 0">
      <v-card variant="outlined" class="mt-4">
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
      </v-card>
    </template>

    <v-card v-if="content.instructionsMarkdown" variant="outlined" class="mt-4">
      <v-card-title class="text-subtitle-1 font-weight-medium">
        {{ t(strings.instructions) }}
      </v-card-title>
      <v-card-text class="pt-0 text-body-2">
        <pre class="ma-0 text-body-2 font-family-inherit">{{ content.instructionsMarkdown }}</pre>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RecipePreview } from "@sderickson/recipes-sdk";
import { rootLinks } from "@sderickson/recipes-links";
import { recipes_detail_page as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
import { ingredientLine } from "./Detail.logic.ts";
import { useReverseT } from "@sderickson/recipes-root-spa/i18n";

const { t } = useReverseT();
const { recipeQuery } = useDetailLoader();

if (!recipeQuery.data.value) {
  throw new Error("Failed to load recipe");
}

const recipe = computed(() => recipeQuery.data.value!.recipe);
const currentVersion = computed(() => recipeQuery.data.value!.currentVersion);
const content = computed(() => currentVersion.value.content);
</script>

<style scoped>
.font-family-inherit {
  font-family: inherit;
}
pre {
  white-space: pre-wrap;
}
</style>
