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

    <RecipeContentPreview
      :title="recipe.title"
      :short-description="recipe.shortDescription"
      :long-description="recipe.longDescription ?? undefined"
      :content="content"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RecipeContentPreview, RecipePreview } from "@sderickson/recipes-sdk";
import { rootLinks } from "@sderickson/recipes-links";
import { recipes_detail_page as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
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
