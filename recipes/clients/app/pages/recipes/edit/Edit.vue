<template>
  <v-container>
    <v-btn :to="'/recipes/list'" variant="text" class="mb-4">
      {{ t(strings.back_to_list) }}
    </v-btn>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <h1 class="flex-grow-1">{{ t(strings.title) }}</h1>
      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-eye"
        @click="showPreviewDialog = true"
      >
        {{ t(strings.preview_heading) }}
      </v-btn>
    </div>

    <RecipeForm
      v-model="formModel"
      :recipe="recipeQuery.data.value ?? null"
      :on-success="handleSuccess"
    />

    <v-dialog v-model="showPreviewDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          {{ t(strings.preview_heading) }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showPreviewDialog = false"
          />
        </v-card-title>
        <v-card-text>
          <RecipeContentPreview
            :title="formModel.title"
            :subtitle="formModel.subtitle"
            :description="formModel.description ?? undefined"
            :content="formModel.initialVersion?.content ?? { ingredients: [], instructionsMarkdown: '' }"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { recipes_edit_page as strings } from "./Edit.strings.ts";
import { useEditLoader } from "./Edit.loader.ts";
import { assertEditDataLoaded, recipeToFormModel } from "./Edit.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const router = useRouter();
const { recipeQuery } = useEditLoader();

assertEditDataLoaded(recipeQuery.data.value);

const formModel = ref(recipeToFormModel(recipeQuery.data.value!));
const showPreviewDialog = ref(false);

function handleSuccess(recipeId: string) {
  router.push(`/recipes/${recipeId}`);
}
</script>
