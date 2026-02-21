<template>
  <div>
    <h2 class="text-h6 mb-4">{{ t(strings.title) }}</h2>
    <p class="text-medium-emphasis mb-4">{{ t(strings.description) }}</p>

    <template v-if="loading">
      <v-row>
        <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4">
          <v-card>
            <v-card-title>
              <v-skeleton-loader type="heading" />
            </v-card-title>
            <v-card-text>
              <v-skeleton-loader type="paragraph" class="mb-2" />
              <v-skeleton-loader type="text" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
      {{ getTanstackErrorMessage(error) }}
    </v-alert>

    <v-alert
      v-else-if="recipes.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      {{ t(strings.empty) }}
    </v-alert>

    <v-row v-else>
      <v-col
        v-for="recipe in recipes"
        :key="recipe.id"
        cols="12"
        sm="6"
        md="4"
      >
        <RecipePreview :recipe="recipe" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from "@sderickson/recipes-spec";
import { TanstackError, getTanstackErrorMessage } from "@saflib/sdk";
import RecipePreview from "../recipe-preview/RecipePreview.vue";
import { recipe_list_strings as strings } from "./RecipeList.strings.ts";
import { useReverseT } from "../../i18n.ts";

const { t } = useReverseT();

defineProps<{
  /** List of recipes to display (from list query). Data fetching is handled by the parent. */
  recipes: Recipe[];
  loading?: boolean;
  error?: TanstackError;
}>();
</script>
