<template>
  <v-container>
    <v-btn :to="'/recipes/list'" variant="text" class="mb-4">
      {{ t(strings.back_to_list) }}
    </v-btn>
    <h1>{{ recipe.title }}</h1>
    <p v-if="recipe.shortDescription" class="text-medium-emphasis">
      {{ recipe.shortDescription }}
    </p>
    <p v-if="recipe.longDescription" class="mt-2">
      {{ recipe.longDescription }}
    </p>
    <template v-if="content.ingredients.length > 0">
      <h2 class="mt-4">{{ t(strings.ingredients) }}</h2>
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
      <h2 class="mt-4">{{ t(strings.instructions) }}</h2>
      <div class="recipe-instructions">
        {{ content.instructionsMarkdown }}
      </div>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { recipes_detail_page as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
import { assertRecipeLoaded } from "./Detail.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const { recipeQuery } = useDetailLoader();

assertRecipeLoaded(recipeQuery.data.value);

const recipe = computed(() => recipeQuery.data.value!.recipe);
const currentVersion = computed(() => recipeQuery.data.value!.currentVersion);
const content = computed(() => currentVersion.value.content);
</script>
