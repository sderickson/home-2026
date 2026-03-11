<template>
  <v-container>
    <v-breadcrumbs class="pl-0 mb-2">
      <v-breadcrumbs-item :to="appLinks.home.path">
        {{ t(strings.breadcrumb_home) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="appLinks.recipesList.path">
        {{ t(strings.breadcrumb_recipes) }}
      </v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item :to="`/recipes/${data.recipe.id}`">
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { recipes_edit_page as strings } from "./Edit.strings.ts";
import { useEditLoader } from "./Edit.loader.ts";
import { assertEditDataLoaded, recipeToFormModel } from "./Edit.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import type { RecipeFormModel } from "../../../components/recipes/RecipeForm.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { appLinks } from "@sderickson/recipes-links";

const { t } = useReverseT();
const router = useRouter();
const { recipeQuery } = useEditLoader();

assertEditDataLoaded(recipeQuery.data.value);

const data = recipeQuery.data.value!;
const formModel = ref<RecipeFormModel>(recipeToFormModel(data));

function handleSuccess(recipeId: string) {
  router.push(`/recipes/${recipeId}`);
}
</script>
