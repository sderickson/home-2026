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
        <RecipeContentPreview
          :title="recipe.title"
          :short-description="recipe.shortDescription"
          :long-description="recipe.longDescription ?? undefined"
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
          <v-card variant="outlined" class="mb-3">
            <v-card-title class="text-subtitle-1">
              {{ t(strings.add_note) }}
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="newNoteBody"
                :placeholder="t(strings.note_body_placeholder)"
                rows="3"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-2"
              />
              <v-btn
                color="primary"
                :loading="createMutation.isPending.value"
                :disabled="!newNoteBody.trim()"
                @click="submitNewNote"
              >
                {{ t(strings.create_note) }}
              </v-btn>
            </v-card-text>
          </v-card>
        </template>

        <template v-if="notesForLatestVersion.length === 0">
          <p class="text-medium-emphasis">{{ t(strings.no_notes) }}</p>
        </template>
        <template v-else>
          <v-card
            variant="outlined"
            class="mb-3"
            v-for="note in notesForLatestVersion"
            :key="note.id"
          >
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
                    :disabled="updateMutation.isPending.value"
                    @click="startEditNote(note)"
                  >
                    {{ t(strings.edit_note) }}
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    color="error"
                    :disabled="deleteMutation.isPending.value"
                    @click="confirmDeleteNote(note)"
                  >
                    {{ t(strings.delete_note) }}
                  </v-btn>
                </template>
              </div>
              <template v-if="editingNoteId === note.id">
                <v-textarea
                  v-model="editBody"
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
                    :loading="updateMutation.isPending.value"
                    @click="saveEditNote(note)"
                  >
                    {{ t(strings.save_note) }}
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    @click="editingNoteId = null"
                  >
                    {{ t(strings.cancel) }}
                  </v-btn>
                </div>
              </template>
        <template v-else>
          <p class="text-body-2 mb-0">{{ note.body }}</p>
              </template>
            </v-card-text>
          </v-card>
        </template>

        <v-divider class="my-4" />
        <h2 class="text-h6 mb-2">{{ t(strings.files_section) }}</h2>

        <template v-if="showFilesEdit">
          <v-card variant="outlined" class="mb-3">
            <v-card-text>
              <input
                ref="fileInputRef"
                type="file"
                class="d-none"
                @change="onFileInputChange"
              />
              <v-btn
                variant="outlined"
                prepend-icon="mdi-paperclip"
                class="mb-2"
                @click="triggerFileInputClick"
              >
                {{ t(strings.choose_file) }}
              </v-btn>
              <div v-if="selectedFile" class="d-flex align-center gap-2 mb-2">
                <span class="text-body-2">{{ selectedFile.name }}</span>
                <v-btn
                  color="primary"
                  size="small"
                  :loading="uploadFileMutation.isPending.value"
                  @click="submitUploadFile"
                >
                  {{ t(strings.upload_file) }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </template>

        <template v-if="files.length === 0">
          <p class="text-medium-emphasis">{{ t(strings.no_files) }}</p>
        </template>
        <template v-else>
          <v-card
            variant="outlined"
            class="mb-3"
            v-for="file in files"
            :key="file.id"
          >
            <v-card-text class="d-flex align-center">
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
              <template v-if="showFilesEdit">
                <v-btn
                  size="small"
                  variant="text"
                  color="error"
                  :disabled="deleteFileMutation.isPending.value"
                  @click="confirmDeleteFile(file)"
                >
                  {{ t(strings.delete_file) }}
                </v-btn>
              </template>
            </v-card-text>
          </v-card>
        </template>
      </v-col>
    </v-row>

    <v-dialog
      v-model="versionHistoryModalOpen"
      max-width="600"
      persistent
      @click:outside="versionHistoryModalOpen = false"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          {{ t(strings.version_history_modal_title) }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="versionHistoryModalOpen = false"
          />
        </v-card-title>
        <v-card-text>
          <v-expansion-panels variant="accordion">
            <v-expansion-panel
              v-for="ver in versionsNewestFirst"
              :key="ver.id"
              :value="ver.id"
            >
              <v-expansion-panel-title>
                {{
                  ver.isLatest
                    ? t(strings.version_latest)
                    : (t(strings.version_from_date) as string).replace(
                        "{date}",
                        formatVersionDate(ver.createdAt),
                      )
                }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <RecipeContentPreview
                  :title="recipe.title"
                  :short-description="recipe.shortDescription"
                  :long-description="recipe.longDescription ?? undefined"
                  :content="ver.content"
                />
                <template v-if="notesByVersionId.get(ver.id)?.length">
                  <p class="text-caption text-medium-emphasis mt-2 mb-1">
                    {{ t(strings.notes_for_version) }}
                  </p>
                  <ul class="text-body-2 pl-4 mb-0">
                    <li
                      v-for="n in notesByVersionId.get(ver.id)"
                      :key="n.id"
                      class="mb-1"
                    >
                      {{ n.body }}
                      <span
                        v-if="n.everEdited"
                        class="text-caption text-medium-emphasis"
                      >
                        ({{ t(strings.ever_edited) }})
                      </span>
                    </li>
                  </ul>
                </template>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="versionHistoryModalOpen = false">
            {{ t(strings.close) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="400" persistent>
      <v-card>
        <v-card-title>{{ t(strings.delete_note) }}</v-card-title>
        <v-card-text>
          {{ t(strings.delete_note_confirm) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">
            {{ t(strings.cancel) }}
          </v-btn>
          <v-btn
            color="error"
            :loading="deleteMutation.isPending.value"
            @click="doDeleteNote"
          >
            {{ t(strings.delete_note) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteFileDialogOpen" max-width="400" persistent>
      <v-card>
        <v-card-title>{{ t(strings.delete_file) }}</v-card-title>
        <v-card-text>
          {{ t(strings.delete_file_confirm) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteFileDialogOpen = false">
            {{ t(strings.cancel) }}
          </v-btn>
          <v-btn
            color="error"
            :loading="deleteFileMutation.isPending.value"
            @click="doDeleteFile"
          >
            {{ t(strings.delete_file) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { recipes_detail_page as strings } from "./Detail.strings.ts";
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertFilesLoaded,
  assertNotesLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  canShowNotesEdit,
  canShowVersionHistory,
  formatVersionDate,
  notesByVersionIdMap,
} from "./Detail.logic.ts";
import { useDetailNotesFlow } from "./useDetailNotesFlow.ts";
import { useDetailFilesFlow } from "./useDetailFilesFlow.ts";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";

const { t } = useReverseT();
const {
  profileQuery,
  recipeQuery,
  versionsQuery,
  notesQuery,
  filesQuery,
} = useDetailLoader();

assertRecipeLoaded(recipeQuery.data.value);
assertProfileLoaded(profileQuery.data.value);
assertVersionsLoaded(versionsQuery.data.value);
assertNotesLoaded(notesQuery.data.value);
assertFilesLoaded(filesQuery.data.value);

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

const {
  fileInputRef,
  selectedFile,
  deleteFileDialogOpen,
  uploadFileMutation,
  deleteFileMutation,
  triggerFileInputClick,
  onFileInputChange,
  submitUploadFile,
  confirmDeleteFile,
  doDeleteFile,
} = useDetailFilesFlow(computed(() => recipe.value.id));

const versionHistoryModalOpen = ref(false);
const versionsNewestFirst = computed(() => [...versions.value].reverse());

const notesByVersionId = computed(() => notesByVersionIdMap(notes.value));
const notesForLatestVersion = computed(() => {
  const versionId = currentVersion.value?.id;
  if (!versionId) return [];
  return [...notes.value]
    .filter((n) => n.recipeVersionId === versionId)
    .reverse();
});

const {
  createMutation,
  updateMutation,
  deleteMutation,
  newNoteBody,
  editingNoteId,
  editBody,
  deleteDialogOpen,
  submitNewNote,
  startEditNote,
  saveEditNote,
  confirmDeleteNote,
  doDeleteNote,
} = useDetailNotesFlow(
  computed(() => recipe.value.id),
  computed(() => currentVersion.value?.id),
);
</script>
