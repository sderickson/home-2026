<template>
  <v-container>
    <h1 class="text-h4 mb-4">{{ t(strings.title) }}</h1>
    <RecipeList :recipes="recipes" :get-recipe-link-props="getRecipeLinkProps" />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RecipeList } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-root-spa/i18n";
import { linkToProps } from "@saflib/links";
import { rootLinks } from "@sderickson/recipes-links";
import { recipes_list_page as strings } from "./List.strings.ts";
import { useListLoader } from "./List.loader.ts";

const { t } = useReverseT();
const { recipesQuery } = useListLoader();

if (!recipesQuery.data.value) {
  throw new Error("Failed to load recipes");
}

const recipes = computed(() => recipesQuery.data.value ?? []);

function getRecipeLinkProps(recipeId: string) {
  return linkToProps({
    ...rootLinks.recipesDetail,
    path: `/recipes/${recipeId}`,
  });
}
</script>
