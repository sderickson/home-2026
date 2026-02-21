<template>
  <v-container>
    <v-btn :to="'/recipes/list'" variant="text" class="mb-4">
      {{ t(strings.back_to_list) }}
    </v-btn>
    <h1>{{ t(strings.title) }}</h1>

    <v-row>
      <v-col cols="12" md="6">
        <RecipeForm
          v-model="formModel"
          :recipe="recipeQuery.data.value ?? null"
          :on-success="handleSuccess"
        />
      </v-col>
      <v-col cols="12" md="6">
        <h2 class="text-h6 mb-2">{{ t(strings.preview_heading) }}</h2>
        <RecipeContentPreview
          :title="formModel.title"
          :short-description="formModel.shortDescription"
          :long-description="formModel.longDescription ?? undefined"
          :content="formModel.initialVersion?.content ?? { ingredients: [], instructionsMarkdown: '' }"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { recipes_edit_page as strings } from "./Edit.strings.ts";
import { useEditLoader } from "./Edit.loader.ts";
import { assertEditDataLoaded, recipeToFormModel } from "./Edit.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import RecipeContentPreview from "../../../components/recipes/RecipeContentPreview.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const router = useRouter();
const { recipeQuery } = useEditLoader();

assertEditDataLoaded(recipeQuery.data.value);

const formModel = ref(recipeToFormModel(recipeQuery.data.value!));

function handleSuccess(recipeId: string) {
  router.push(`/recipes/${recipeId}`);
}
</script>
