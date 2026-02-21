<template>
  <v-container>
    <h1>{{ t(strings.title) }}</h1>
    <v-btn
      v-if="showCreateRecipe"
      :to="'/recipes/create'"
      color="primary"
      class="mb-4"
    >
      {{ t(strings.create_recipe) }}
    </v-btn>
    <div v-if="recipes.length === 0" class="text-medium-emphasis">
      {{ t(strings.empty_list) }}
    </div>
    <v-list v-else>
      <v-list-item
        v-for="recipe in recipes"
        :key="recipe.id"
        :to="`/recipes/${recipe.id}`"
        :title="recipe.title"
        :subtitle="recipe.shortDescription"
        lines="two"
      />
    </v-list>
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
