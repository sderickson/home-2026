<template>
  <v-container>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <v-btn :to="'/recipes/list'" variant="text" prepend-icon="mdi-arrow-left">
        {{ t(strings.back_to_list) }}
      </v-btn>
      <v-spacer />
      <v-btn
        :to="`/recipes/${recipe.id}/edit`"
        color="primary"
        prepend-icon="mdi-pencil"
      >
        {{ t(strings.edit_recipe) }}
      </v-btn>
    </div>
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
