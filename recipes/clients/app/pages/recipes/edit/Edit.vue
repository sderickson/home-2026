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

    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <h1 class="flex-grow-1 text-h4">{{ t(strings.title) }}</h1>
      <v-btn
        variant="outlined"
        prepend-icon="mdi-eye"
        @click="showPreviewDialog = true"
      >
        {{ t(strings.preview_heading) }}
      </v-btn>
      <v-menu location="bottom end" transition="scale-transition">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            color="primary"
            prepend-icon="mdi-content-save"
            :disabled="!recipeFormRef?.isValid"
            :loading="saveMenuLoading"
          >
            {{ t(strings.save_button) }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            :disabled="!recipeFormRef?.isValid"
            :loading="isUpdateLatestPending"
            prepend-icon="mdi-pencil"
            :title="t(strings.save_menu_update_current)"
            @click="onUpdateCurrentVersion"
          />
          <v-list-item
            :disabled="!recipeFormRef?.isValid"
            :loading="isCreateVersionPending"
            prepend-icon="mdi-plus-box"
            :title="t(strings.save_menu_create_new)"
            @click="onCreateNewVersion"
          />
        </v-list>
      </v-menu>
    </div>

    <RecipeForm
      ref="recipeFormRef"
      v-model="formModel"
      layout="tabs"
      :recipe="recipeQuery.data.value ?? null"
      :on-success="handleSuccess"
      @request-save-new-version="openCommitDialog"
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
          <v-btn
            color="primary"
            :loading="commitSaving"
            @click="confirmCommit"
          >
            {{ t(strings.commit_confirm) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { recipes_edit_page as strings } from "./Edit.strings.ts";
import { useEditLoader } from "./Edit.loader.ts";
import {
  assertEditDataLoaded,
  getEditedFields,
  recipeToFormModel,
} from "./Edit.logic.ts";
import RecipeForm from "../../../components/recipes/RecipeForm.vue";
import type { RecipeFormModel } from "../../../components/recipes/RecipeForm.vue";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { appLinks } from "@sderickson/recipes-links";

const { t } = useReverseT();
const router = useRouter();
const { recipeQuery } = useEditLoader();

assertEditDataLoaded(recipeQuery.data.value);

const data = recipeQuery.data.value!;
const initialFormModel = recipeToFormModel(data);
const formModel = ref<RecipeFormModel>(initialFormModel);
const showPreviewDialog = ref(false);
const showCommitDialog = ref(false);
const commitMessage = ref("");
const commitSaving = ref(false);
const recipeFormRef = ref<InstanceType<typeof RecipeForm> | null>(null);

const isUpdateLatestPending = computed(
  () =>
    (recipeFormRef.value?.isUpdateLatestPending as Ref<boolean> | undefined)
      ?.value ?? false,
);
const isCreateVersionPending = computed(
  () =>
    (recipeFormRef.value?.isCreateVersionPending as Ref<boolean> | undefined)
      ?.value ?? false,
);
const saveMenuLoading = computed(
  () =>
    isUpdateLatestPending.value ||
    isCreateVersionPending.value ||
    commitSaving.value,
);

function onUpdateCurrentVersion() {
  void recipeFormRef.value?.updateLatestVersion();
}

function onCreateNewVersion() {
  openCommitDialog();
}

function openCommitDialog() {
  const fields = getEditedFields(initialFormModel, formModel.value);
  commitMessage.value =
    fields.length > 0
      ? t(strings.commit_default_prefix) + fields.join(", ")
      : "";
  showCommitDialog.value = true;
}

async function confirmCommit() {
  if (!recipeFormRef.value) return;
  commitSaving.value = true;
  try {
    await recipeFormRef.value.saveNewVersionWithNote(commitMessage.value);
    showCommitDialog.value = false;
  } finally {
    commitSaving.value = false;
  }
}

function handleSuccess(recipeId: string) {
  router.push(`/recipes/${recipeId}`);
}
</script>
