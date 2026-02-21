<template>
  <v-container>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <h1 class="text-h4">{{ t(strings.title) }}</h1>
      <v-spacer />
      <v-btn
        v-if="showCreateRecipe"
        :to="'/recipes/create'"
        color="primary"
        prepend-icon="mdi-plus"
      >
        {{ t(strings.create_recipe) }}
      </v-btn>
    </div>

    <v-alert
      v-if="recipes.length === 0"
      variant="tonal"
      type="info"
      class="mb-4"
      icon="mdi-book-open-variant-outline"
    >
      {{ t(strings.empty_list) }}
    </v-alert>

    <v-card v-else variant="outlined">
      <v-list lines="two">
        <v-list-item
          v-for="recipe in recipes"
          :key="recipe.id"
          :to="`/recipes/${recipe.id}`"
          :title="recipe.title"
          :subtitle="recipe.shortDescription"
          prepend-icon="mdi-book-open-page-variant-outline"
          append-icon="mdi-chevron-right"
          link
        />
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { recipes_list_page as strings } from "./List.strings.ts";
import { useListLoader } from "./List.loader.ts";
import {
  assertProfileLoaded,
  assertRecipesLoaded,
  canShowCreateRecipe,
  getRecipesList,
} from "./List.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const { profileQuery, recipesQuery } = useListLoader();

assertProfileLoaded(profileQuery.data.value);
assertRecipesLoaded(recipesQuery.data.value);

const profile = profileQuery.data.value;
const recipes = computed(() => getRecipesList(recipesQuery.data.value));
const showCreateRecipe = computed(() => canShowCreateRecipe(profile));
</script>
