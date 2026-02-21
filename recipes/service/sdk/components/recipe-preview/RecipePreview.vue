<template>
  <v-card :aria-busy="loading" :aria-label="loading ? t(strings.loadingLabel) : undefined">
    <template v-if="loading">
      <v-card-title>
        <v-skeleton-loader type="heading" />
      </v-card-title>
      <v-card-text>
        <v-skeleton-loader type="paragraph" class="mb-2" />
        <v-skeleton-loader type="text" />
      </v-card-text>
    </template>

    <template v-else>
      <v-card-title>
        {{ recipe.title }}
      </v-card-title>

      <v-card-text>
        <p class="text-medium-emphasis">
          {{ recipe.shortDescription }}
        </p>
      </v-card-text>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import type { Recipe, RecipeVersion } from "@sderickson/recipes-spec";
import { recipe_preview_strings as strings } from "./RecipePreview.strings.ts";
import { useReverseT } from "../../i18n.ts";

const { t } = useReverseT();

defineProps<{
  /** Recipe metadata (and optionally current version id from list responses). */
  recipe: Recipe;
  /** Optional current version for display (e.g. ingredient count). */
  currentVersion?: RecipeVersion | null;
  /** Show skeleton when data is loading. */
  loading?: boolean;
}>();
</script>
