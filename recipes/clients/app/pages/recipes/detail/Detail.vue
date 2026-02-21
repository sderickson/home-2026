<template>
  <v-container>
    <v-btn :to="'/recipes/list'" variant="text" class="mb-4">
      {{ t(strings.back_to_list) }}
    </v-btn>
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
import { recipes_detail_page as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
import { assertRecipeLoaded } from "./Detail.logic.ts";
import RecipeContentPreview from "../../../components/recipes/RecipeContentPreview.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const { recipeQuery } = useDetailLoader();

assertRecipeLoaded(recipeQuery.data.value);

const recipe = computed(() => recipeQuery.data.value!.recipe);
const currentVersion = computed(() => recipeQuery.data.value!.currentVersion);
const content = computed(() => currentVersion.value.content);
</script>
