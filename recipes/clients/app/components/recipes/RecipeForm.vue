<template>
  <form class="recipe-form" @submit.prevent>
    <v-card variant="outlined" class="mb-4 rounded-lg overflow-hidden">
      <v-toolbar density="comfortable" class="rounded-t-lg">
        <v-toolbar-title>
          <template v-if="recipe">
            {{ recipe.recipe.title }}
          </template>
          <template v-else>
            {{ t(strings.new_recipe_title) }}
          </template>
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon="mdi-eye"
          variant="text"
          :title="t(strings.toolbar_preview)"
          @click="showPreviewDialog = true"
        />
        <v-btn
          v-if="recipe"
          icon="mdi-content-save"
          variant="text"
          :disabled="!isValid"
          :loading="editSaveLoading"
          :title="t(strings.toolbar_save)"
          @click="handleEditCreatesNewVersion"
        />
        <v-btn
          v-else
          icon="mdi-content-save"
          color="primary"
          variant="flat"
          :disabled="!isValid"
          :loading="createMutation.isPending.value"
          :title="t(strings.toolbar_save)"
          @click="handleCreate"
        />
      </v-toolbar>

      <div
        class="pa-4 bg-surface rounded-b-lg d-flex flex-column recipe-form__body"
      >
        <v-row class="flex-grow-1">
          <v-col cols="12" md="6" class="recipe-form__col-min">
            <v-text-field
              v-model="model.title"
              :label="t(strings.title_label)"
              :placeholder="t(strings.title_placeholder)"
              variant="outlined"
              class="mb-4"
            />
            <v-textarea
              v-model="model.description"
              :label="t(strings.description_label)"
              :placeholder="t(strings.description_placeholder)"
              variant="outlined"
              auto-grow
              rows="3"
              class="mb-4"
            />
            <div class="text-subtitle-2 mb-1">
              {{ t(strings.ingredients_label) }}
            </div>
            <RecipeIngredientsForm
              :model-value="content().ingredients ?? []"
              @update:model-value="setIngredients"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="d-flex flex-column recipe-form__col-min"
          >
            <div
              class="d-flex flex-column flex-grow-1 recipe-form__instructions-wrap"
            >
              <v-textarea
                v-model="content().instructionsMarkdown"
                :label="t(strings.instructions_label)"
                :placeholder="t(strings.instructions_placeholder)"
                variant="outlined"
                rows="6"
                class="flex-grow-1 recipe-form__instructions-field"
              />
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <v-dialog v-model="showPreviewDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          {{ t(strings.toolbar_preview) }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showPreviewDialog = false"
          />
        </v-card-title>
        <v-card-text>
          <RecipeContentPreview
            :recipe="previewRecipe"
            :current-version="previewVersion"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  Recipe,
  RecipesServiceRequestBody,
  RecipesServiceResponseBody,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import RecipeIngredientsForm from "./RecipeIngredientsForm.vue";
import { recipe_form as strings } from "./RecipeForm.strings.ts";
import { isRecipeFormValid } from "./RecipeForm.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import {
  useCreateRecipeMutation,
  useCreateRecipeVersionMutation,
  useUpdateRecipeMutation,
} from "@sderickson/recipes-sdk";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";

const { t } = useReverseT();

export type RecipeFormModel = Omit<
  RecipesServiceRequestBody["createRecipe"],
  "initialVersion"
> & {
  initialVersion: {
    content: {
      ingredients: { name: string; quantity: string; unit: string }[];
      instructionsMarkdown: string;
    };
  };
};

type GetRecipeResponse = RecipesServiceResponseBody["getRecipe"][200];

const props = withDefaults(
  defineProps<{
    recipe?: GetRecipeResponse | null;
    onSuccess?: (recipeId: string) => void;
  }>(),
  { recipe: null, onSuccess: undefined },
);

const emit = defineEmits<{
  success: [recipeId: string];
}>();

const model = defineModel<RecipeFormModel>({ required: true });
const showPreviewDialog = ref(false);

const createMutation = useCreateRecipeMutation();
const updateMutation = useUpdateRecipeMutation();
const createVersionMutation = useCreateRecipeVersionMutation();

const isValid = computed(() => isRecipeFormValid(model.value));

/** Recipe shape for preview (form state). */
const previewRecipe = computed((): Recipe => {
  const m = model.value;
  const base = props.recipe?.recipe;
  return (base
    ? { ...base, title: m.title, subtitle: m.subtitle, description: m.description ?? null }
    : {
        id: "",
        title: m.title,
        subtitle: m.subtitle,
        description: m.description ?? null,
        createdBy: "",
        createdAt: "",
        updatedBy: "",
        updatedAt: "",
      }) as Recipe;
});

/** Version shape for preview (form content). */
const previewVersion = computed((): RecipeVersion =>
  ({
    id: "",
    recipeId: props.recipe?.recipe.id ?? "",
    content: content(),
    isLatest: true,
    createdBy: "",
    createdAt: "",
  }) as RecipeVersion,
);

const editSaveLoading = computed(
  () =>
    updateMutation.isPending.value || createVersionMutation.isPending.value,
);

function content() {
  return model.value.initialVersion.content;
}

function setIngredients(
  v: {
    name: string;
    quantity: string;
    unit: string;
  }[],
) {
  model.value.initialVersion.content.ingredients = v;
}

async function handleCreate() {
  if (!isValid.value) return;
  const data = await createMutation.mutateAsync(model.value);
  emit("success", data.recipe.id);
  props.onSuccess?.(data.recipe.id);
}

async function handleEditCreatesNewVersion() {
  if (!props.recipe || !isValid.value) return;
  const { recipe } = props.recipe;
  await updateMutation.mutateAsync({
    id: recipe.id,
    title: model.value.title,
    subtitle: model.value.subtitle,
    description: model.value.description ?? undefined,
  });
  const version = await createVersionMutation.mutateAsync({
    id: recipe.id,
    ...content(),
  });
  void version;
  emit("success", recipe.id);
  props.onSuccess?.(recipe.id);
}
</script>

<style scoped>
.recipe-form__body {
  min-height: 50vh;
}

@media (min-width: 960px) {
  .recipe-form__col-min {
    min-width: 400px;
  }
}

.recipe-form__instructions-wrap {
  min-height: 0;
}

.recipe-form__instructions-field :deep(textarea) {
  min-height: 100%;
  height: 100% !important;
}
</style>
