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
            :disabled="noteFlow.updateMutation.isPending.value"
            @click="noteFlow.startEditNote(note)"
          >
            {{ t(strings.edit_note) }}
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            color="error"
            :disabled="noteFlow.deleteMutation.isPending.value"
            @click="noteFlow.confirmDeleteNote(note)"
          >
            {{ t(strings.delete_note) }}
          </v-btn>
        </template>
      </div>
      <template v-if="noteFlow.editingNoteId?.value === note.id">
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
            :loading="noteFlow.updateMutation.isPending.value"
            @click="noteFlow.saveEditNote(note)"
          >
            {{ t(strings.save_note) }}
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            @click="noteFlow.cancelEdit()"
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
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-paperclip"
            @click="noteFileFlow.setUploadTargetAndTrigger(note.id)"
          >
            {{ t(strings.choose_file) }}
          </v-btn>
          <div
            v-if="noteFileFlow.selectedNoteFile?.value && noteFileFlow.uploadTargetNoteId?.value === note.id"
            class="d-flex align-center gap-2 mb-2"
          >
            <span class="text-body-2">{{ noteFileFlow.selectedNoteFile?.value?.name }}</span>
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
                @click="noteFileFlow.confirmDeleteNoteFile(file)"
              >
                {{ t(strings.delete_file) }}
              </v-btn>
            </template>
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { computed } from "vue";
import type { RecipeNote, RecipeNoteFileInfo } from "@sderickson/recipes-spec";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { note_card as strings } from "./NoteCard.strings.ts";
import { formatVersionDate } from "./Detail.logic.ts";

const props = defineProps<{
  note: RecipeNote;
  files: RecipeNoteFileInfo[];
  showNotesEdit: boolean;
  noteFlow: {
    editingNoteId: Ref<string | null>;
    editBody: Ref<string>;
    updateMutation: { isPending: { value: boolean } };
    deleteMutation: { isPending: { value: boolean } };
    startEditNote: (note: RecipeNote) => void;
    saveEditNote: (note: RecipeNote) => void;
    cancelEdit: () => void;
    confirmDeleteNote: (note: RecipeNote) => void;
  };
  noteFileFlow: {
    selectedNoteFile: Ref<File | null>;
    uploadTargetNoteId: Ref<string | null>;
    uploadMutation: { isPending: { value: boolean } };
    deleteMutation: { isPending: { value: boolean } };
    setUploadTargetAndTrigger: (noteId: string) => void;
    submitUploadFile: () => void;
    confirmDeleteNoteFile: (file: RecipeNoteFileInfo) => void;
  };
}>();

const editBodyModel = computed({
  get: () => props.noteFlow.editBody.value,
  set: (v: string) => {
    props.noteFlow.editBody.value = v;
  },
});

const { t } = useReverseT();
</script>
