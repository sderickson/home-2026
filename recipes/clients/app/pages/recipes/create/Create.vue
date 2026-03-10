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

    <v-row>
      <v-col cols="12" md="6">
        <v-card variant="outlined" class="pa-4">
          <RecipeForm
            v-model="formModel"
            :on-success="handleSuccess"
          />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1 font-weight-medium">
            {{ t(strings.preview_heading) }}
          </v-card-title>
          <v-divider />
          <v-card-text>
            <RecipeContentPreview
              :title="formModel.title"
              :subtitle="formModel.subtitle"
              :description="formModel.description ?? undefined"
              :content="formModel.initialVersion?.content ?? { ingredients: [], instructionsMarkdown: '' }"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
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
