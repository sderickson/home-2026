<template>
  <v-container>
    <v-breadcrumbs class="pl-0 mb-2">
      <v-breadcrumbs-item :to="appLinks.home.path">
        {{ t(strings.breadcrumb_home) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item>
        {{ t(strings.breadcrumb_recipes) }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <h1 class="text-h4">{{ t(strings.title) }}</h1>
      <v-spacer />
      <v-btn
        v-if="showCreateRecipe"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-import"
        @click="quickImportOpen = true"
      >
        {{ t(strings.quick_import) }}
      </v-btn>
      <v-btn
        v-if="showCreateRecipe"
        v-bind="createLinkProps"
        color="primary"
        prepend-icon="mdi-plus"
      >
        {{ t(strings.create_recipe) }}
      </v-btn>
    </div>

    <RecipeList :recipes="recipes" :get-recipe-link-props="getRecipeLinkProps" />

    <QuickImportDialog
      v-model="quickImportOpen"
      @success="onQuickImportSuccess"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { RecipeList } from "@sderickson/recipes-sdk";
import { linkToProps } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { recipes_list_page as strings } from "./List.strings.ts";
import { useListLoader } from "./List.loader.ts";
import {
  assertProfileLoaded,
  assertRecipesLoaded,
  canShowCreateRecipe,
  getRecipesList,
} from "./List.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import QuickImportDialog from "./QuickImportDialog.vue";

const { t } = useReverseT();
const router = useRouter();
const { profileQuery, recipesQuery } = useListLoader();

assertProfileLoaded(profileQuery.data.value);
assertRecipesLoaded(recipesQuery.data.value);

const profile = profileQuery.data.value;
const recipes = computed(() => getRecipesList(recipesQuery.data.value));
const showCreateRecipe = computed(() => canShowCreateRecipe(profile));
const createLinkProps = linkToProps(appLinks.recipesCreate);
const quickImportOpen = ref(false);

function getRecipeLinkProps(recipeId: string) {
  return linkToProps({
    ...appLinks.recipesDetail,
    path: `/recipes/${recipeId}`,
  });
}

function onQuickImportSuccess(recipeId: string) {
  router.push(`/recipes/${recipeId}`);
}
</script>
