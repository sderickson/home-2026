<template>
  <v-container>
    <div class="d-flex align-center flex-wrap gap-2 mb-4">
      <v-btn :to="'/recipes/list'" variant="text" prepend-icon="mdi-arrow-left">
        {{ t(strings.back_to_list) }}
      </v-btn>
      <v-spacer />
      <v-btn
        :to="`/recipes/${recipe.id}/edit`"
        color="primary"
        prepend-icon="mdi-pencil"
      >
        {{ t(strings.edit_recipe) }}
      </v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="8" lg="9">
        <RecipeFilesDisplay :files="files" />

        <RecipeContentPreview
          :title="recipe.title"
          :subtitle="recipe.subtitle"
          :description="recipe.description ?? undefined"
          :content="content"
        />

        <template v-if="showVersionHistory">
          <v-divider class="my-4" />
          <h2 class="text-h6 mb-2">{{ t(strings.version_history) }}</h2>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-history"
            @click="versionHistoryModalOpen = true"
          >
            {{ t(strings.version_history_open) }}
          </v-btn>
        </template>
      </v-col>

      <v-col cols="12" md="4" lg="3">
        <h2 class="text-h6 mb-2">{{ t(strings.notes_section) }}</h2>

        <template v-if="showNotesEdit">
          <AddNoteCard
            :recipe-id="recipe.id"
            :latest-version-id="currentVersion?.id"
          />
        </template>

        <template v-if="notesForLatestVersion.length === 0">
          <p class="text-medium-emphasis">{{ t(strings.no_notes) }}</p>
        </template>
        <template v-else>
          <NoteCard
            v-for="note in notesForLatestVersion"
            :key="note.id"
            :recipe-id="recipe.id"
            :latest-version-id="currentVersion?.id"
            :note="note"
            :files="getFilesForNote(note)"
            :show-notes-edit="showNotesEdit"
          />
        </template>

        <v-divider class="my-4" />
        <RecipeFilesSection
          :files="files"
          :show-files-edit="showFilesEdit"
          :files-flow="filesFlow"
        />
      </v-col>
    </v-row>

    <VersionHistoryModal
      v-model="versionHistoryModalOpen"
      :recipe="recipe"
      :versions="versionsNewestFirst"
      :notes-by-version-id="notesByVersionId"
    />

    <ConfirmDialog
      v-model="deleteFileDialogOpen"
      :title="t(strings.delete_file)"
      :message="t(strings.delete_file_confirm)"
      :confirm-label="t(strings.delete_file)"
      :cancel-label="t(strings.cancel)"
      :loading="deleteFileMutation.isPending.value"
      @confirm="doDeleteFile"
    />

  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { recipes_detail_page as strings } from "./Detail.strings.ts";
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
import {
  RecipeContentPreview,
  RecipeFilesDisplay,
} from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import AddNoteCard from "./AddNoteCard.vue";
import NoteCard from "./NoteCard.vue";
import RecipeFilesSection from "./RecipeFilesSection.vue";
import VersionHistoryModal from "./VersionHistoryModal.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const { t } = useReverseT();
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
const content = computed(() => currentVersion.value.content);
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

const versionHistoryModalOpen = ref(false);
const versionsNewestFirst = computed(() => [...versions.value].reverse());

const notesByVersionId = computed(() => notesByVersionIdMap(notes.value));
const notesForLatestVersion = computed(() =>
  notesForLatestVersionFn(notes.value, currentVersion.value?.id),
);

const noteIdToFiles = computed(() =>
  groupNoteFilesByNoteId(noteFilesByRecipeQuery.data.value ?? []),
);

function getFilesForNote(note: { id: string }) {
  return noteIdToFiles.value.get(note.id) ?? [];
}

const deleteFileDialogOpen = filesFlow.deleteFileDialogOpen;
const deleteFileMutation = filesFlow.deleteFileMutation;
const doDeleteFile = filesFlow.doDeleteFile;
</script>
