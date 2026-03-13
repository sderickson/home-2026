<template>
  <div>
    <v-container fluid class="pa-0">
      <v-breadcrumbs class="pl-0 mb-2">
        <v-breadcrumbs-item :to="appLinks.home.path">
          {{ t(strings.breadcrumb_home) }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="appLinks.collectionsHome.path">
          {{ t(strings.breadcrumb_collections) }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="recipesListPath">
          {{ collectionName }}
        </v-breadcrumbs-item>
        <v-breadcrumbs-divider />
        <v-breadcrumbs-item :to="recipeDetailPath">
          {{ recipe.title }}
        </v-breadcrumbs-item>
      </v-breadcrumbs>

      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-toolbar density="comfortable">
              <v-toolbar-title class="text-h6">{{
                recipe.title
              }}</v-toolbar-title>
              <v-spacer />
              <template v-if="showVersionHistory">
                <v-tooltip
                  location="bottom"
                  :text="t(strings.toolbar_version_history)"
                >
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-bind="tooltipProps"
                      icon
                      variant="text"
                      @click="versionHistoryModalOpen = true"
                    >
                      <v-badge
                        :model-value="versions.length > 0"
                        :content="versions.length"
                        color="primary"
                      >
                        <v-icon>mdi-history</v-icon>
                      </v-badge>
                    </v-btn>
                  </template>
                </v-tooltip>
              </template>
              <v-tooltip
                v-if="showEdit"
                location="bottom"
                :text="t(strings.toolbar_edit)"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    v-bind="tooltipProps"
                    icon
                    variant="text"
                    :to="recipeEditPath"
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
                      :model-value="
                        !notesDrawerOpen && notesForLatestVersion.length > 0
                      "
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
                    <v-menu location="bottom">
                      <template #activator="{ props: menuProps }">
                        <v-btn
                          v-bind="{ ...tooltipProps, ...menuProps }"
                          icon
                          variant="text"
                          :disabled="
                            filesFlow.uploadFileMutation.isPending.value
                          "
                        >
                          <v-icon>mdi-image-plus</v-icon>
                        </v-btn>
                      </template>
                      <v-list density="compact">
                        <v-list-item
                          :title="t(strings.toolbar_upload_image)"
                          prepend-icon="mdi-upload"
                          @click="imageFileInputRef?.click()"
                        />
                        <v-list-item
                          :title="t(strings.toolbar_choose_unsplash)"
                          prepend-icon="mdi-image-search"
                          @click="unsplashPickerOpen = true"
                        />
                      </v-list>
                    </v-menu>
                  </template>
                </v-tooltip>
                <input
                  :ref="
                    (el) => {
                      imageFileInputRef = el as HTMLInputElement | null;
                    }
                  "
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="filesFlow.onFileInputChangeAndUpload"
                />
              </template>
              <template v-if="showEdit && showFilesEdit">
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

            <!-- Card body: content preview + notes panel side by side within border -->
            <div class="detail-card-body d-flex">
              <div class="detail-card-preview flex-grow-1 min-width-0">
                <RecipeContentPreview
                  :recipe="recipe"
                  :current-version="currentVersion"
                  :files="files"
                  :show-image-actions="showFilesEdit"
                  :image-delete-disabled="
                    filesFlow.deleteFileMutation.isPending.value
                  "
                  @click-image="expandedImageFile = $event"
                  @delete-image="filesFlow.confirmDeleteFile($event)"
                />
              </div>
              <v-sheet
                v-if="notesDrawerOpen"
                variant="outlined"
                class="detail-notes-panel d-flex flex-column flex-shrink-0"
              >
                <div
                  class="text-subtitle-2 text-medium-emphasis px-3 py-2 flex-shrink-0"
                >
                  {{ t(strings.notes_section) }}
                </div>
                <v-divider />
                <div
                  class="detail-notes-list flex-grow-1 min-height-0 overflow-y-auto pa-2"
                >
                  <template v-if="notesForLatestVersion.length === 0">
                    <p class="text-body-2 text-medium-emphasis pa-2">
                      {{ t(strings.no_notes) }}
                    </p>
                  </template>
                  <template v-else>
                    <NoteCard
                      v-for="note in notesTimelineOrder"
                      :key="note.id"
                      :recipe-id="recipe.id"
                      :latest-version-id="currentVersion?.id"
                      :note="note"
                      :files="getFilesForNote(note)"
                      :show-notes-edit="showNotesEdit"
                    />
                  </template>
                </div>
                <template v-if="showNotesEdit">
                  <v-divider />
                  <div class="detail-notes-composer pa-2 flex-shrink-0">
                    <AddNoteCard
                      :recipe-id="recipe.id"
                      :latest-version-id="currentVersion?.id"
                    />
                  </div>
                </template>
              </v-sheet>
            </div>
          </v-card>
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
        <v-card-text
          v-if="expandedImageFile.unsplashAttribution"
          class="text-caption text-medium-emphasis py-2 px-3"
        >
          <i18n-t
            scope="global"
            :keypath="lookupTKey(strings.unsplash_photo_by)"
          >
            <template #name>
              <a
                :href="
                  expandedImageFile.unsplashAttribution.photographerProfileUrl
                "
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary text-decoration-none"
              >
                {{ expandedImageFile.unsplashAttribution.photographerName }}
              </a>
            </template>
          </i18n-t>
          <a
            :href="expandedImageFile.unsplashAttribution.unsplashSourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary text-decoration-none ms-1"
          >
            on Unsplash
          </a>
        </v-card-text>
      </v-card>
    </v-dialog>

    <UnsplashPickerDialog
      v-model="unsplashPickerOpen"
      :recipe-id="recipe.id"
      :recipe-title="recipe.title"
    />

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
import { useRoute, useRouter } from "vue-router";
import { recipes_detail_page as strings } from "./Detail.strings.ts";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import { useDetailLoader } from "./Detail.loader.ts";
import {
  assertFilesLoaded,
  assertNotesLoaded,
  assertNoteFilesByRecipeLoaded,
  assertProfileLoaded,
  assertRecipeLoaded,
  assertVersionsLoaded,
  canEditInCollection,
  groupNoteFilesByNoteId,
  notesByVersionIdMap,
  notesForLatestVersion as notesForLatestVersionFn,
} from "./Detail.logic.ts";
import { useDetailFilesFlow } from "./useDetailFilesFlow.ts";
import {
  RecipeContentPreview,
  useDeleteRecipeMutation,
} from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import AddNoteCard from "./AddNoteCard.vue";
import NoteCard from "./NoteCard.vue";
import VersionHistoryModal from "./VersionHistoryModal.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import UnsplashPickerDialog from "./UnsplashPickerDialog.vue";

const { t, lookupTKey } = useReverseT();
const router = useRouter();
const route = useRoute();
const collectionId = route.params.collectionId as string;
const {
  profileQuery,
  collectionQuery,
  membersQuery,
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
const collection = computed(() => collectionQuery.data.value?.collection);
const collectionName = computed(() => collection.value?.name ?? collectionId);
const members = computed(() => membersQuery.data.value?.members ?? []);
const userEmail = computed(() => profileQuery.data.value?.email ?? "");
const currentMember = computed(() =>
  members.value.find((m) => m.email === userEmail.value),
);
const showEdit = computed(() => canEditInCollection(currentMember.value?.role));
const versions = computed(() => versionsQuery.data.value ?? []);
const notes = computed(() => notesQuery.data.value ?? []);
const showVersionHistory = computed(() => true);
const showNotesEdit = computed(() => showEdit.value);
const showFilesEdit = computed(() => showEdit.value);

const recipesListPath = computed(() =>
  constructPath(appLinks.recipesList, { params: { collectionId } }),
);
const recipeDetailPath = computed(() =>
  constructPath(appLinks.recipesDetail, {
    params: { collectionId, id: recipe.value.id },
  }),
);
const recipeEditPath = computed(() =>
  constructPath(appLinks.recipesEdit, {
    params: { collectionId, id: recipe.value.id },
  }),
);

const files = computed(() => filesQuery.data.value ?? []);

const filesFlow = useDetailFilesFlow(computed(() => recipe.value.id));
const deleteRecipeMutation = useDeleteRecipeMutation();

const versionHistoryModalOpen = ref(false);
const notesDrawerOpen = ref(false);
const deleteRecipeDialogOpen = ref(false);
const unsplashPickerOpen = ref(false);
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
const notesTimelineOrder = computed(() =>
  [...notesForLatestVersion.value].reverse(),
);

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
  await router.push(
    constructPath(appLinks.recipesList, { params: { collectionId } }),
  );
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

<style scoped>
.detail-card-body {
  min-height: 420px;
}
.detail-notes-panel {
  width: 33%;
  min-width: 280px;
  max-width: 400px;
  min-height: 420px;
  border-inline-start: 1px solid
    rgba(var(--v-border-color), var(--v-border-opacity));
}
.detail-notes-list {
  min-height: 0;
}
</style>
