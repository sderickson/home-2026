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
      <v-breadcrumbs-item>
        {{ t(strings.breadcrumb_new) }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <h1 class="text-h4 mb-4">{{ t(strings.title) }}</h1>

    <RecipeForm
      v-model="formModel"
      @success="handleSuccess"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { recipes_create_page as strings } from "./Create.strings.ts";
import { useCreateLoader } from "./Create.loader.ts";
import { assertCreateDataLoaded } from "./Create.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import type { RecipeFormModel } from "../../../components/recipes/RecipeForm.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { appLinks } from "@sderickson/recipes-links";

const { t } = useReverseT();
const router = useRouter();
const { profileQuery } = useCreateLoader();

assertCreateDataLoaded(profileQuery.data.value);

const formModel = ref<RecipeFormModel>({
  title: "",
  subtitle: "",
  description: null,
  isPublic: false,
  initialVersion: {
    content: {
      ingredients: [],
      instructionsMarkdown: "",
    },
  },
  note: "",
});

function handleSuccess(recipeId: string) {
  router.push(`/recipes/${recipeId}`);
}
</script>
