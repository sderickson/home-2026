<template>
  <div class="note-card py-2">
    <div class="d-flex align-start gap-1">
      <v-menu v-if="showNotesEdit" location="start" transition="scale-transition">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon
            size="x-small"
            variant="text"
            density="compact"
            class="note-card__menu-btn flex-shrink-0 mt-n1"
          >
            <v-icon size="small">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" min-width="140">
          <v-list-item
            prepend-icon="mdi-pencil"
            :title="t(strings.edit_note)"
            :disabled="notesFlow.updateMutation.isPending.value"
            @click="notesFlow.startEditNote(note)"
          />
          <v-list-item
            prepend-icon="mdi-paperclip"
            :title="t(strings.attach_file)"
            :disabled="notesFlow.createMutation.isPending.value"
            @click="setUploadTargetAndTrigger()"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-delete"
            :title="t(strings.delete_note)"
            class="text-error"
            :disabled="notesFlow.deleteMutation.isPending.value"
            @click="notesFlow.confirmDeleteNote(note)"
          />
        </v-list>
      </v-menu>
      <div class="flex-grow-1 min-width-0">
        <div class="text-caption text-medium-emphasis mb-0">
          {{ formatNoteDateTime(note.createdAt) }}
          <span v-if="note.everEdited" class="ml-1">· {{ t(strings.ever_edited) }}</span>
        </div>
        <template v-if="notesFlow.editingNoteId?.value === note.id">
          <v-textarea
            v-model="editBodyModel"
            :placeholder="t(strings.note_body_placeholder)"
            rows="2"
            variant="outlined"
            density="compact"
            hide-details
            class="mt-1 mb-1"
            autofocus
            @keydown.ctrl.enter="notesFlow.saveEditNote(note)"
          />
          <div class="d-flex gap-1">
            <v-btn
              size="x-small"
              color="primary"
              :loading="notesFlow.updateMutation.isPending.value"
              @click="notesFlow.saveEditNote(note)"
            >
              {{ t(strings.save_note) }}
            </v-btn>
            <v-btn size="x-small" variant="text" @click="notesFlow.cancelEdit()">
              {{ t(strings.cancel) }}
            </v-btn>
          </div>
        </template>
        <template v-else>
          <p class="text-body-2 mb-0 mt-0 break-word">{{ note.body }}</p>
          <template v-if="files.length > 0">
            <div class="text-caption text-medium-emphasis mt-1">
              <template v-for="file in files" :key="file.id">
                <a
                  v-if="file.downloadUrl"
                  :href="file.downloadUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary text-decoration-none mr-2"
                >
                  {{ file.fileOriginalName }}
                </a>
                <span v-else class="mr-2">{{ file.fileOriginalName }}</span>
              </template>
            </div>
          </template>
        </template>
      </div>
    </div>

    <input
      v-if="showNotesEdit"
      :ref="(el) => { noteFileFlow.fileInputRef.value = (el as HTMLInputElement) ?? null }"
      type="file"
      class="d-none"
      @change="noteFileFlow.onFileInputChangeAndUpload"
    />

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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RecipeNote, RecipeNoteFileInfo } from "@sderickson/recipes-spec";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { note_card as strings } from "./NoteCard.strings.ts";
import { recipes_detail_page as detailStrings } from "./Detail.strings.ts";
import { formatNoteDateTime } from "./Detail.logic.ts";
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

<style scoped>
.note-card {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.note-card:last-child {
  border-bottom: none;
}
.break-word {
  word-break: break-word;
}
</style>
