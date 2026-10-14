<template>
  <v-container>
    <h1 class="text-h4 mb-4">{{ t(strings.title) }}</h1>

    <RecipeForm v-model="formModel" @success="handleSuccess" />
  </v-container>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@sderickson/recipes-clients-common";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { recipes_create_page as strings } from "./Create.strings.ts";
import { useCreateLoader } from "./Create.loader.ts";
import { assertCreateDataLoaded } from "./Create.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import type { RecipeFormModel } from "../../../components/recipes/RecipeForm.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";

const { t } = useReverseT();
const route = useRoute();
const router = useRouter();
const collectionId = route.params.collectionId as string;
const { sessionQuery, collectionQuery } = useCreateLoader();

assertCreateDataLoaded(sessionQuery.data.value);

const collection = computed(() => collectionQuery.data.value?.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const collectionDetailPath = computed(() =>
  constructPath(appLinks.collectionsDetail, { params: { collectionId } }),
);

const formModel = ref<RecipeFormModel>({
  collectionId,
  title: "",
  subtitle: "",
  description: null,
  initialVersion: {
    content: {
      ingredients: [],
      instructionsMarkdown: "",
    },
  },
});

function handleSuccess(recipeId: string) {
  router.push(
    constructPath(appLinks.recipesDetail, {
      params: { collectionId, id: recipeId },
    }),
  );
}

useBreadcrumbs(() => [
  { title: collectionName.value, to: collectionDetailPath.value },
  { title: t(strings.breadcrumb_new) },
]);
</script>
