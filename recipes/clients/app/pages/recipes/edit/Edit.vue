<template>
  <v-container>
    <v-breadcrumbs class="pl-0 mb-2">
      <v-breadcrumbs-item :to="appLinks.home.path">
        {{ t(strings.breadcrumb_home) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="appLinks.collectionsHome.path">
        {{ t(strings.breadcrumb_collections) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="recipesListPath">
        {{ collectionName }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="recipeDetailPath">
        {{ data.recipe.title }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item>
        {{ t(strings.breadcrumb_edit) }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <RecipeForm
      v-model="formModel"
      :recipe="recipeQuery.data.value ?? null"
      @success="handleSuccess"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { recipes_edit_page as strings } from "./Edit.strings.ts";
import { useEditLoader } from "./Edit.loader.ts";
import { assertEditDataLoaded, recipeToFormModel } from "./Edit.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import type { RecipeFormModel } from "../../../components/recipes/RecipeForm.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { appLinks } from "@sderickson/recipes-links";

const { t } = useReverseT();
const route = useRoute();
const router = useRouter();
const collectionId = route.params.collectionId as string;
const { collectionQuery, recipeQuery } = useEditLoader();

assertEditDataLoaded(recipeQuery.data.value);

const data = recipeQuery.data.value!;
const formModel = ref<RecipeFormModel>(recipeToFormModel(data));

const collection = computed(() => collectionQuery.data.value?.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const recipesListPath = computed(() => `/c/${collectionId}/recipes/list`);
const recipeDetailPath = computed(() => `/c/${collectionId}/recipes/${data.recipe.id}`);

function handleSuccess(recipeId: string) {
  router.push(`/c/${collectionId}/recipes/${recipeId}`);
}
</script>
