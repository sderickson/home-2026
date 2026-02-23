<template>
  <form class="recipe-form" @submit.prevent>
    <v-text-field
      v-model="model.title"
      :label="t(strings.title_label)"
      :placeholder="t(strings.title_placeholder)"
      variant="outlined"
      class="mb-2"
    />
    <v-text-field
      v-model="model.shortDescription"
      :label="t(strings.short_description_label)"
      :placeholder="t(strings.short_description_placeholder)"
      variant="outlined"
      class="mb-2"
    />
    <v-text-field
      v-model="model.longDescription"
      :label="t(strings.long_description_label)"
      :placeholder="t(strings.long_description_placeholder)"
      variant="outlined"
      class="mb-2"
    />
    <v-checkbox
      v-model="model.isPublic"
      :label="t(strings.is_public_label)"
      :hint="t(strings.is_public_hint)"
      persistent-hint
      class="mb-2"
    />
    <div class="mb-2">
      <div class="text-subtitle-2 mb-1">{{ t(strings.ingredients_label) }}</div>
      <div
        v-for="(ing, i) in content().ingredients"
        :key="i"
        class="d-flex gap-2 align-center mb-1"
      >
        <v-text-field
          v-model="ing.quantity"
          :placeholder="t(strings.ingredient_quantity_placeholder)"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-0"
          style="max-width: 6rem"
        />
        <v-text-field
          v-model="ing.unit"
          :placeholder="t(strings.ingredient_unit_placeholder)"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-0"
          style="max-width: 6rem"
        />
        <v-text-field
          v-model="ing.name"
          :placeholder="t(strings.ingredient_name_placeholder)"
          variant="outlined"
          density="compact"
          hide-details
          class="flex-grow-1"
        />
        <v-btn
          icon="mdi-minus"
          variant="text"
          size="small"
          @click="removeIngredient(i)"
        />
      </div>
      <v-btn
        variant="outlined"
        size="small"
        class="mt-1"
        @click="addIngredient"
      >
        {{ t(strings.add_ingredient) }}
      </v-btn>
    </div>
    <v-textarea
      v-model="content().instructionsMarkdown"
      :label="t(strings.instructions_label)"
      :placeholder="t(strings.instructions_placeholder)"
      variant="outlined"
      rows="6"
      class="mb-2"
    />
    <v-textarea
      v-if="recipe"
      v-model="model.note"
      :label="t(strings.note_label)"
      :placeholder="t(strings.note_placeholder)"
      variant="outlined"
      rows="3"
      class="mb-2"
    />
    <div class="d-flex gap-2 mt-2">
      <template v-if="recipe">
        <v-btn
          color="primary"
          :disabled="!isValid"
          :loading="updateLatestMutation.isPending.value"
          @click="handleUpdateLatest"
        >
          {{ t(strings.submit_update_latest) }}
        </v-btn>
        <v-btn
          variant="outlined"
          :disabled="!isValid"
          :loading="createVersionMutation.isPending.value"
          @click="handleSaveNewVersion"
        >
          {{ t(strings.submit_save_new_version) }}
        </v-btn>
      </template>
      <v-btn
        v-else
        color="primary"
        :disabled="!isValid"
        :loading="createMutation.isPending.value"
        @click="handleCreate"
      >
        {{ t(strings.submit_create) }}
      </v-btn>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import { recipe_form as strings } from "./RecipeForm.strings.ts";
import { isRecipeFormValid } from "./RecipeForm.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import {
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useUpdateRecipeVersionLatestMutation,
  useCreateRecipeVersionMutation,
  useNotesCreateRecipesMutation,
} from "@sderickson/recipes-sdk";

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
  /** Optional note attached to the version when saving (edit page). */
  note: string;
};

type GetRecipeResponse = RecipesServiceResponseBody["getRecipe"][200];

const props = withDefaults(
  defineProps<{
    recipe?: GetRecipeResponse | null;
    onSuccess?: (recipeId: string) => void;
  }>(),
  { recipe: null, onSuccess: undefined },
);

const model = defineModel<RecipeFormModel>({ required: true });

const createMutation = useCreateRecipeMutation();
const updateMutation = useUpdateRecipeMutation();
const updateLatestMutation = useUpdateRecipeVersionLatestMutation();
const createVersionMutation = useCreateRecipeVersionMutation();
const notesCreateMutation = useNotesCreateRecipesMutation();

function content() {
  return model.value.initialVersion.content;
}

function addIngredient() {
  content().ingredients.push({
    name: "",
    quantity: "",
    unit: "",
  });
}

function removeIngredient(index: number) {
  content().ingredients.splice(index, 1);
}

const isValid = computed(() => isRecipeFormValid(model.value));

async function handleCreate() {
  if (!isValid.value) return;
  const { note: _note, ...createPayload } = model.value;
  const data = await createMutation.mutateAsync(createPayload);
  const noteBody = model.value.note?.trim();
  if (data.initialVersion && noteBody) {
    await notesCreateMutation.mutateAsync({
      id: data.recipe.id,
      body: noteBody,
      recipeVersionId: data.initialVersion.id,
    });
  }
  props.onSuccess?.(data.recipe.id);
}

async function handleUpdateLatest() {
  if (!props.recipe || !isValid.value) return;
  const { recipe } = props.recipe;
  await updateMutation.mutateAsync({
    id: recipe.id,
    title: model.value.title,
    shortDescription: model.value.shortDescription,
    longDescription: model.value.longDescription ?? undefined,
    isPublic: model.value.isPublic,
  });
  const version = await updateLatestMutation.mutateAsync({
    id: recipe.id,
    ...content(),
  });
  const noteBody = model.value.note?.trim();
  if (noteBody) {
    await notesCreateMutation.mutateAsync({
      id: recipe.id,
      body: noteBody,
      recipeVersionId: version.id,
    });
  }
  props.onSuccess?.(recipe.id);
}

async function handleSaveNewVersion() {
  if (!props.recipe || !isValid.value) return;
  const { recipe } = props.recipe;
  await updateMutation.mutateAsync({
    id: recipe.id,
    title: model.value.title,
    shortDescription: model.value.shortDescription,
    longDescription: model.value.longDescription ?? undefined,
    isPublic: model.value.isPublic,
  });
  const version = await createVersionMutation.mutateAsync({
    id: recipe.id,
    ...content(),
  });
  const noteBody = model.value.note?.trim();
  if (noteBody) {
    await notesCreateMutation.mutateAsync({
      id: recipe.id,
      body: noteBody,
      recipeVersionId: version.id,
    });
  }
  props.onSuccess?.(recipe.id);
}

defineExpose({ isValid });
</script>
