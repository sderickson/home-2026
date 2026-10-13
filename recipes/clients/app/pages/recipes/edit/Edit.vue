<template>
  <v-container>
    <RecipeForm
      v-model="formModel"
      :recipe="recipeQuery.data.value ?? null"
      @success="handleSuccess"
    />
  </v-container>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@sderickson/recipes-clients-common";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { recipes_edit_page as strings } from "./Edit.strings.ts";
import { useEditLoader } from "./Edit.loader.ts";
import { assertEditDataLoaded, recipeToFormModel } from "./Edit.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import type { RecipeFormModel } from "../../../components/recipes/RecipeForm.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";

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
const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);
const recipeDetailPath = computed(() =>
  constructPath(appLinks.recipesDetail, {
    params: { collectionId, id: data.recipe.id },
  }),
);

function handleSuccess(recipeId: string) {
  router.push(
    constructPath(appLinks.recipesDetail, {
      params: { collectionId, id: recipeId },
    }),
  );
}

useBreadcrumbs(() => [
  { title: collectionName.value, to: collectionDetailPath.value },
  { title: data.recipe.title, to: recipeDetailPath.value },
  { title: t(strings.breadcrumb_edit) },
]);
</script>
