<template>
  <v-card variant="outlined" class="mb-3">
    <v-card-text>
      <div class="d-flex align-center flex-wrap gap-2 mb-2">
        <span class="text-caption text-medium-emphasis">
          {{ formatVersionDate(note.createdAt) }}
        </span>
        <v-chip v-if="note.everEdited" size="small" variant="tonal">
          {{ t(strings.ever_edited) }}
        </v-chip>
        <v-spacer />
        <template v-if="showNotesEdit">
          <v-btn
            size="small"
            variant="text"
            :disabled="notesFlow.updateMutation.isPending.value"
            @click="notesFlow.startEditNote(note)"
          >
            {{ t(strings.edit_note) }}
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            color="error"
            :disabled="notesFlow.deleteMutation.isPending.value"
            @click="notesFlow.confirmDeleteNote(note)"
          >
            {{ t(strings.delete_note) }}
          </v-btn>
        </template>
      </div>
      <template v-if="notesFlow.editingNoteId?.value === note.id">
        <v-textarea
          v-model="editBodyModel"
          :placeholder="t(strings.note_body_placeholder)"
          rows="3"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-2"
        />
        <div class="d-flex gap-2">
          <v-btn
            size="small"
            color="primary"
            :loading="notesFlow.updateMutation.isPending.value"
            @click="notesFlow.saveEditNote(note)"
          >
            {{ t(strings.save_note) }}
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            @click="notesFlow.cancelEdit()"
          >
            {{ t(strings.cancel) }}
          </v-btn>
        </div>
      </template>
      <template v-else>
        <p class="text-body-2 mb-0">{{ note.body }}</p>
      </template>
      <div class="mt-2 pt-2">
        <p class="text-caption text-medium-emphasis mb-1">
          {{ t(strings.note_files_section) }}
        </p>
        <template v-if="showNotesEdit">
          <input
            :ref="(el) => { noteFileFlow.fileInputRef.value = (el as HTMLInputElement) ?? null }"
            type="file"
            class="d-none"
            @change="noteFileFlow.onFileInputChange"
          />
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-paperclip"
            @click="setUploadTargetAndTrigger()"
          >
            {{ t(strings.choose_file) }}
          </v-btn>
          <div
            v-if="noteFileFlow.selectedFile?.value && noteFileFlow.uploadTargetNoteId?.value === note.id"
            class="d-flex align-center gap-2 mb-2"
          >
            <span class="text-body-2">{{ noteFileFlow.selectedFile?.value?.name }}</span>
            <v-btn
              color="primary"
              size="small"
              :loading="noteFileFlow.uploadMutation.isPending.value"
              @click="noteFileFlow.submitUploadFile()"
            >
              {{ t(strings.upload_file) }}
            </v-btn>
          </div>
        </template>
        <template v-if="files.length === 0">
          <p class="text-medium-emphasis text-body-2 mb-0">
            {{ t(strings.note_no_files) }}
          </p>
        </template>
        <template v-else>
          <div
            v-for="file in files"
            :key="file.id"
            class="d-flex align-center mb-1"
          >
            <a
              v-if="file.downloadUrl"
              :href="file.downloadUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-body-2 text-primary text-decoration-none"
            >
              {{ file.fileOriginalName }}
            </a>
            <span v-else class="text-body-2">{{ file.fileOriginalName }}</span>
            <v-spacer />
            <template v-if="showNotesEdit">
              <v-btn
                size="small"
                variant="text"
                color="error"
                :disabled="noteFileFlow.deleteMutation.isPending.value"
                @click="noteFileFlow.confirmDeleteFile(file)"
              >
                {{ t(strings.delete_file) }}
              </v-btn>
            </template>
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>

  <ConfirmDialog
    v-model="deleteNoteDialogModel"
    :title="t(detailStrings.delete_note)"
    :message="t(detailStrings.delete_note_confirm)"
    :confirm-label="t(detailStrings.delete_note)"
    :cancel-label="t(detailStrings.cancel)"
    :loading="notesFlow.deleteMutation.isPending.value"
    @confirm="notesFlow.doDeleteNote()"
  />

  <ConfirmDialog
    v-model="deleteNoteFileDialogModel"
    :title="t(detailStrings.delete_file)"
    :message="t(detailStrings.delete_file_confirm)"
    :confirm-label="t(detailStrings.delete_file)"
    :cancel-label="t(detailStrings.cancel)"
    :loading="noteFileFlow.deleteMutation.isPending.value"
    @confirm="noteFileFlow.doDeleteFile()"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RecipeNote, RecipeNoteFileInfo } from "@sderickson/recipes-spec";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { note_card as strings } from "./NoteCard.strings.ts";
import { recipes_detail_page as detailStrings } from "./Detail.strings.ts";
import { formatVersionDate } from "./Detail.logic.ts";
import { useDetailNotesFlow } from "./useDetailNotesFlow.ts";
import { useDetailNoteFilesFlow } from "./useDetailNoteFilesFlow.ts";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = defineProps<{
  recipeId: string;
  latestVersionId: string | undefined;
  note: RecipeNote;
  files: RecipeNoteFileInfo[];
  showNotesEdit: boolean;
}>();

const notesFlow = useDetailNotesFlow(
  computed(() => props.recipeId),
  computed(() => props.latestVersionId),
);

const noteFileFlow = useDetailNoteFilesFlow(computed(() => props.recipeId));

function setUploadTargetAndTrigger() {
  noteFileFlow.setUploadTargetNote(props.note.id);
  noteFileFlow.triggerFileInputClick();
}

const editBodyModel = computed({
  get: () => notesFlow.editBody.value,
  set: (v: string) => {
    notesFlow.editBody.value = v;
  },
});

const deleteNoteDialogModel = computed({
  get: () => notesFlow.deleteDialogOpen.value,
  set: (v: boolean) => {
    notesFlow.deleteDialogOpen.value = v;
  },
});

const deleteNoteFileDialogModel = computed({
  get: () => noteFileFlow.deleteNoteFileDialogOpen.value,
  set: (v: boolean) => {
    noteFileFlow.deleteNoteFileDialogOpen.value = v;
  },
});

const { t } = useReverseT();
</script>
