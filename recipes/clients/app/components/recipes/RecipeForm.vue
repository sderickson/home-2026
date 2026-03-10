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
        <template #extension>
          <v-tabs
            v-model="activeTab"
            bg-color="transparent"
            color="primary"
            density="comfortable"
            class="flex-grow-1"
          >
            <v-tab :value="0">{{ t(strings.tab_contents) }}</v-tab>
            <v-tab :value="1">{{ t(strings.tab_metadata) }}</v-tab>
          </v-tabs>
        </template>
        <v-spacer />
        <v-btn
          icon="mdi-eye"
          variant="text"
          :title="t(strings.toolbar_preview)"
          @click="showPreviewDialog = true"
        />
        <template v-if="recipe">
          <v-menu location="bottom end" transition="scale-transition">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="mdi-content-save"
                variant="text"
                :disabled="!isValid"
                :loading="saveMenuLoading"
                :title="t(strings.toolbar_save)"
              />
            </template>
            <v-list>
              <v-list-item
                :disabled="!isValid"
                :loading="updateLatestMutation.isPending.value"
                prepend-icon="mdi-pencil"
                :title="t(strings.save_menu_update_current)"
                @click="onUpdateCurrentVersion"
              />
              <v-list-item
                :disabled="!isValid"
                :loading="createVersionMutation.isPending.value"
                prepend-icon="mdi-plus-box"
                :title="t(strings.save_menu_create_new)"
                @click="openCommitDialog"
              />
            </v-list>
          </v-menu>
        </template>
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

      <v-window v-model="activeTab">
        <v-window-item :value="0">
          <div
            class="pa-4 bg-surface rounded-b-lg d-flex flex-column recipe-form__tab-contents"
            style="min-height: 50vh"
          >
            <v-row class="flex-grow-1">
              <v-col cols="12" md="6" class="recipe-form__col-min">
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
        </v-window-item>
        <v-window-item :value="1">
          <div class="pa-4 bg-surface rounded-b-lg">
            <v-row>
              <v-col cols="12" md="5" class="recipe-form__col-min">
                <v-text-field
                  v-model="model.title"
                  :label="t(strings.title_label)"
                  :placeholder="t(strings.title_placeholder)"
                  variant="outlined"
                  class="mb-2"
                />
                <v-text-field
                  v-model="model.subtitle"
                  :label="t(strings.subtitle_label)"
                  :placeholder="t(strings.subtitle_placeholder)"
                  variant="outlined"
                  class="mb-2"
                />
                <v-switch
                  v-model="model.isPublic"
                  :label="t(strings.is_public_label)"
                  :hint="t(strings.is_public_hint)"
                  persistent-hint
                  color="primary"
                  class="mb-2"
                />
              </v-col>
              <v-col cols="12" md="7" class="recipe-form__col-min">
                <v-textarea
                  v-model="model.description"
                  :label="t(strings.description_label)"
                  :placeholder="t(strings.description_placeholder)"
                  variant="outlined"
                  auto-grow
                  rows="2"
                  class="mb-2"
                />
              </v-col>
            </v-row>
          </div>
        </v-window-item>
      </v-window>
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
            :title="model.title"
            :subtitle="model.subtitle"
            :description="model.description ?? undefined"
            :content="content()"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showCommitDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>{{ t(strings.commit_dialog_title) }}</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="commitMessage"
            :label="t(strings.commit_message_label)"
            :placeholder="t(strings.commit_message_placeholder)"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCommitDialog = false">
            {{ t(strings.commit_cancel) }}
          </v-btn>
          <v-btn color="primary" :loading="commitSaving" @click="confirmCommit">
            {{ t(strings.commit_confirm) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";
import type { RecipesServiceResponseBody } from "@sderickson/recipes-spec";
import RecipeIngredientsForm from "./RecipeIngredientsForm.vue";
import { recipe_form as strings } from "./RecipeForm.strings.ts";
import { isRecipeFormValid, getEditedFields } from "./RecipeForm.logic.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import {
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useUpdateRecipeVersionLatestMutation,
  useCreateRecipeVersionMutation,
  useNotesCreateRecipesMutation,
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

const emit = defineEmits<{
  success: [recipeId: string];
}>();

const activeTab = ref(0);
const model = defineModel<RecipeFormModel>({ required: true });
const showPreviewDialog = ref(false);
const showCommitDialog = ref(false);
const commitMessage = ref("");
const commitSaving = ref(false);

/** Snapshot of model when recipe was loaded, for commit message default. */
const initialFormModel = ref<RecipeFormModel | null>(null);

watch(
  () => props.recipe,
  (r) => {
    if (r) {
      initialFormModel.value = JSON.parse(
        JSON.stringify(model.value),
      ) as RecipeFormModel;
    } else {
      initialFormModel.value = null;
    }
  },
  { immediate: true },
);

const createMutation = useCreateRecipeMutation();
const updateMutation = useUpdateRecipeMutation();
const updateLatestMutation = useUpdateRecipeVersionLatestMutation();
const createVersionMutation = useCreateRecipeVersionMutation();
const notesCreateMutation = useNotesCreateRecipesMutation();

const isValid = computed(() => isRecipeFormValid(model.value));

const saveMenuLoading = computed(
  () =>
    updateLatestMutation.isPending.value ||
    createVersionMutation.isPending.value ||
    commitSaving.value,
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
  emit("success", data.recipe.id);
  props.onSuccess?.(data.recipe.id);
}

async function handleUpdateLatest() {
  if (!props.recipe || !isValid.value) return;
  const { recipe } = props.recipe;
  await updateMutation.mutateAsync({
    id: recipe.id,
    title: model.value.title,
    subtitle: model.value.subtitle,
    description: model.value.description ?? undefined,
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
  emit("success", recipe.id);
  props.onSuccess?.(recipe.id);
}

async function doSaveNewVersion(noteBody: string) {
  if (!props.recipe || !isValid.value) return;
  const { recipe } = props.recipe;
  await updateMutation.mutateAsync({
    id: recipe.id,
    title: model.value.title,
    subtitle: model.value.subtitle,
    description: model.value.description ?? undefined,
    isPublic: model.value.isPublic,
  });
  const version = await createVersionMutation.mutateAsync({
    id: recipe.id,
    ...content(),
  });
  if (noteBody.trim()) {
    await notesCreateMutation.mutateAsync({
      id: recipe.id,
      body: noteBody.trim(),
      recipeVersionId: version.id,
    });
  }
  emit("success", recipe.id);
  props.onSuccess?.(recipe.id);
}

function openCommitDialog() {
  const initial = initialFormModel.value;
  const fields = initial != null ? getEditedFields(initial, model.value) : [];
  commitMessage.value =
    fields.length > 0
      ? t(strings.commit_default_prefix) + fields.join(", ")
      : "";
  showCommitDialog.value = true;
}

async function confirmCommit() {
  commitSaving.value = true;
  try {
    await doSaveNewVersion(commitMessage.value);
    showCommitDialog.value = false;
  } finally {
    commitSaving.value = false;
  }
}

function onUpdateCurrentVersion() {
  void handleUpdateLatest();
}
</script>

<style scoped>
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
