<template>
  <v-container>
    <v-btn
      :to="'/recipes/list'"
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
    >
      {{ t(strings.back_to_list) }}
    </v-btn>

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
              :short-description="formModel.shortDescription"
              :long-description="formModel.longDescription ?? undefined"
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
import RecipeContentPreview from "../../../components/recipes/RecipeContentPreview.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const router = useRouter();
const { profileQuery } = useCreateLoader();

assertCreateDataLoaded(profileQuery.data.value);

const formModel = ref<RecipeFormModel>({
  title: "",
  shortDescription: "",
  longDescription: null,
  isPublic: false,
  initialVersion: {
    content: {
      ingredients: [],
      instructionsMarkdown: "",
    },
  },
});

function handleSuccess(recipeId: string) {
  router.push(`/recipes/${recipeId}`);
}
</script>
