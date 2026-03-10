<template>
  <div>
    <v-container fluid class="pa-0">
      <v-breadcrumbs class="pl-0 mb-2">
        <v-breadcrumbs-item :to="appLinks.home.path">
          {{ t(strings.breadcrumb_home) }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="appLinks.recipesList.path">
          {{ t(strings.breadcrumb_recipes) }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="`/recipes/${recipe.id}`">
          {{ recipe.title }}
        </v-breadcrumbs-item>
      </v-breadcrumbs>

      <v-card class="mb-4">
        <v-toolbar density="comfortable">
          <v-toolbar-title class="text-h6">{{ recipe.title }}</v-toolbar-title>
          <v-spacer />
          <template v-if="showVersionHistory">
            <v-tooltip location="bottom" :text="t(strings.toolbar_version_history)">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon
                  variant="text"
                  @click="versionHistoryModalOpen = true"
                >
                  <v-icon>mdi-history</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
          <v-tooltip location="bottom" :text="t(strings.toolbar_edit)">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon
                variant="text"
                :to="`/recipes/${recipe.id}/edit`"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="bottom" :text="t(strings.toolbar_notes)">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon
                variant="text"
                :class="{ 'v-btn--active': notesDrawerOpen }"
                @click="notesDrawerOpen = !notesDrawerOpen"
              >
                <v-badge
                  :model-value="notesForLatestVersion.length > 0"
                  :content="notesForLatestVersion.length"
                  color="primary"
                >
                  <v-icon>mdi-note-text</v-icon>
                </v-badge>
              </v-btn>
            </template>
          </v-tooltip>
          <template v-if="showFilesEdit">
            <v-tooltip location="bottom" :text="t(strings.toolbar_images)">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon
                  variant="text"
                  :disabled="filesFlow.uploadFileMutation.isPending.value"
                  @click="imageFileInputRef?.click()"
                >
                  <v-icon>mdi-image-plus</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <input
              :ref="(el) => { imageFileInputRef = el as HTMLInputElement | null; }"
              type="file"
              accept="image/*"
              class="d-none"
              @change="filesFlow.onFileInputChangeAndUpload"
            />
          </template>
          <template v-if="showFilesEdit">
            <v-tooltip location="bottom" :text="t(strings.toolbar_delete)">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon
                  variant="text"
                  color="error"
                  :disabled="deleteRecipeMutation.isPending.value"
                  @click="deleteRecipeDialogOpen = true"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
        </v-toolbar>

        <RecipeContentPreview
          :recipe="recipe"
          :current-version="currentVersion"
          :files="files"
          :show-image-actions="showFilesEdit"
          :image-delete-disabled="filesFlow.deleteFileMutation.isPending.value"
          @click-image="expandedImageFile = $event"
          @delete-image="filesFlow.confirmDeleteFile($event)"
        />
      </v-card>
    </v-container>

    <v-container fluid>
        <v-row>
          <v-col cols="12" :md="notesDrawerOpen ? 8 : 12" :lg="notesDrawerOpen ? 9 : 12">
            <template v-if="showVersionHistory">
            <v-divider class="my-4" />
            <v-btn
              variant="outlined"
              prepend-icon="mdi-history"
              @click="versionHistoryModalOpen = true"
            >
              {{ t(strings.version_history_open) }}
            </v-btn>
          </template>
        </v-col>

        <!-- Notes drawer column -->
        <v-col v-if="notesDrawerOpen" cols="12" md="4" lg="3">
          <v-sheet rounded class="pa-3">
            <h2 class="text-h6 mb-3">{{ t(strings.notes_section) }}</h2>
            <template v-if="showNotesEdit">
              <AddNoteCard
                :recipe-id="recipe.id"
                :latest-version-id="currentVersion?.id"
              />
              <v-divider class="my-3" />
            </template>
            <template v-if="notesForLatestVersion.length === 0">
              <p class="text-medium-emphasis">{{ t(strings.no_notes) }}</p>
            </template>
            <template v-else>
              <v-timeline side="end" density="compact" truncate-line="both">
                <v-timeline-item
                  v-for="note in notesTimelineOrder"
                  :key="note.id"
                  dot-color="primary"
                >
                  <NoteCard
                    :recipe-id="recipe.id"
                    :latest-version-id="currentVersion?.id"
                    :note="note"
                    :files="getFilesForNote(note)"
                    :show-notes-edit="showNotesEdit"
                  />
                </v-timeline-item>
              </v-timeline>
            </template>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>

    <!-- Image expand dialog -->
    <v-dialog
      v-model="expandedImageDialogOpen"
      max-width="90vw"
      max-height="90vh"
      transition="dialog-transition"
      @click:outside="expandedImageFile = null"
    >
      <v-card v-if="expandedImageFile" variant="flat" class="overflow-hidden">
        <v-img
          :src="expandedImageFile.downloadUrl"
          :alt="expandedImageFile.fileOriginalName"
          max-height="85vh"
          contain
        />
      </v-card>
    </v-dialog>

    <VersionHistoryModal
      v-model="versionHistoryModalOpen"
      :recipe="recipe"
      :versions="versionsNewestFirst"
      :notes-by-version-id="notesByVersionId"
    />

    <ConfirmDialog
      :model-value="deleteFileDialogOpen"
      :title="t(strings.delete_file)"
      :message="t(strings.delete_file_confirm)"
      :confirm-label="t(strings.delete_file)"
      :cancel-label="t(strings.cancel)"
      :loading="filesFlow.deleteFileMutation.isPending.value"
      @update:model-value="setDeleteFileDialogOpen"
      @confirm="filesFlow.doDeleteFile"
    />

    <ConfirmDialog
      v-model="deleteRecipeDialogOpen"
      :title="t(strings.delete_recipe)"
      :message="t(strings.delete_recipe_confirm)"
      :confirm-label="t(strings.delete_recipe)"
      :cancel-label="t(strings.cancel)"
      :loading="deleteRecipeMutation.isPending.value"
      @confirm="doDeleteRecipe"
    />
  </div>
</template>

<script setup lang="ts">
import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { recipes_detail_page as strings } from "./Detail.strings.ts";
import { appLinks } from "@sderickson/recipes-links";
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertFilesLoaded,
  assertNotesLoaded,
  assertNoteFilesByRecipeLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  canShowNotesEdit,
  canShowVersionHistory,
  groupNoteFilesByNoteId,
  notesByVersionIdMap,
  notesForLatestVersion as notesForLatestVersionFn,
} from "./Detail.logic.ts";
import { useDetailFilesFlow } from "./useDetailFilesFlow.ts";
import { RecipeContentPreview, useDeleteRecipeMutation } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import AddNoteCard from "./AddNoteCard.vue";
import NoteCard from "./NoteCard.vue";
import VersionHistoryModal from "./VersionHistoryModal.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const { t } = useReverseT();
const router = useRouter();
const {
  profileQuery,
  recipeQuery,
  versionsQuery,
  notesQuery,
  filesQuery,
  noteFilesByRecipeQuery,
} = useDetailLoader();

assertRecipeLoaded(recipeQuery.data.value);
assertProfileLoaded(profileQuery.data.value);
assertVersionsLoaded(versionsQuery.data.value);
assertNotesLoaded(notesQuery.data.value);
assertFilesLoaded(filesQuery.data.value);
assertNoteFilesByRecipeLoaded(noteFilesByRecipeQuery.data.value);

const recipe = computed(() => recipeQuery.data.value!.recipe);
const currentVersion = computed(() => recipeQuery.data.value!.currentVersion);
const profile = computed(() => profileQuery.data.value);
const versions = computed(() => versionsQuery.data.value ?? []);
const notes = computed(() => notesQuery.data.value ?? []);
const showVersionHistory = computed(() =>
  canShowVersionHistory(profile.value as { isAdmin?: boolean }),
);
const showNotesEdit = computed(() =>
  canShowNotesEdit(profile.value as { isAdmin?: boolean }),
);
const showFilesEdit = computed(() =>
  canShowNotesEdit(profile.value as { isAdmin?: boolean }),
);

const files = computed(() => filesQuery.data.value ?? []);

const filesFlow = useDetailFilesFlow(computed(() => recipe.value.id));
const deleteRecipeMutation = useDeleteRecipeMutation();

const versionHistoryModalOpen = ref(false);
const notesDrawerOpen = ref(false);
const deleteRecipeDialogOpen = ref(false);
const imageFileInputRef = ref<HTMLInputElement | null>(null);
const expandedImageFile = ref<RecipeFileInfo | null>(null);

const expandedImageDialogOpen = computed({
  get: () => expandedImageFile.value != null,
  set: (v) => {
    if (!v) expandedImageFile.value = null;
  },
});

const versionsNewestFirst = computed(() => [...versions.value].reverse());
const notesByVersionId = computed(() => notesByVersionIdMap(notes.value));
const notesForLatestVersion = computed(() =>
  notesForLatestVersionFn(notes.value, currentVersion.value?.id),
);
/** Timeline order: oldest first */
const notesTimelineOrder = computed(() => [...notesForLatestVersion.value].reverse());

const noteIdToFiles = computed(() =>
  groupNoteFilesByNoteId(noteFilesByRecipeQuery.data.value ?? []),
);

function getFilesForNote(note: { id: string }) {
  return noteIdToFiles.value.get(note.id) ?? [];
}

const deleteFileDialogOpen = filesFlow.deleteFileDialogOpen;

function setDeleteFileDialogOpen(v: boolean) {
  deleteFileDialogOpen.value = v;
}

async function doDeleteRecipe() {
  await deleteRecipeMutation.mutateAsync(recipe.value.id);
  deleteRecipeDialogOpen.value = false;
  await router.push(appLinks.recipesList.path);
}

// Reset file input after upload so same file can be selected again
watch(
  () => filesFlow.uploadFileMutation.isPending.value,
  (pending, wasPending) => {
    if (wasPending && !pending && imageFileInputRef.value) {
      imageFileInputRef.value.value = "";
    }
  },
);
</script>
