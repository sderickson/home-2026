<template>
  <v-container>
    <v-btn :to="'/recipes/list'" variant="text" class="mb-4">
      {{ t(strings.back_to_list) }}
    </v-btn>
    <h1>{{ t(strings.title) }}</h1>

    <v-row>
      <v-col cols="12" md="6">
        <CreateRecipeForm
          ref="formRef"
          v-model="formModel"
        />
        <v-btn
          color="primary"
          :disabled="!formRef?.isValid"
          @click="handleSubmit"
        >
          {{ t(formStrings.submit) }}
        </v-btn>
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
import { recipes_create_page as strings } from "./Create.strings.ts";
import { create_recipe_form as formStrings } from "./CreateRecipeForm.strings.ts";
import { useCreateLoader } from "./Create.loader.ts";
import { assertCreateDataLoaded } from "./Create.logic.ts";
import { useCreateRecipeMutation } from "@sderickson/recipes-sdk";
import CreateRecipeForm from "./CreateRecipeForm.vue";
import type { CreateRecipeModel } from "./CreateRecipeForm.vue";
import RecipeContentPreview from "./RecipeContentPreview.vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const router = useRouter();
const { profileQuery } = useCreateLoader();

assertCreateDataLoaded(profileQuery.data.value);

const formRef = ref<InstanceType<typeof CreateRecipeForm> | null>(null);

const formModel = ref<CreateRecipeModel>({
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

const createMutation = useCreateRecipeMutation();

async function handleSubmit() {
  if (!formRef.value?.isValid) return;
  const data = await createMutation.mutateAsync(formModel.value);
  router.push(`/recipes/${data.recipe.id}`);
}
</script>
