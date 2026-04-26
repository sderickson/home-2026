<template>
  <div>
    <v-container fluid class="pa-0">
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-toolbar density="comfortable">
              <v-toolbar-title class="text-h6">{{
                props.recipe.title
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
                        :model-value="props.versions.length > 0"
                        :content="props.versions.length"
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

            <RecipeContentPreview
              :recipe="props.recipe"
              :current-version="props.currentVersion"
              :files="props.files"
              :show-image-actions="showFilesEdit"
              :image-delete-disabled="
                filesFlow.deleteFileMutation.isPending.value
              "
              @click-image="expandedImageFile = $event"
              @delete-image="filesFlow.confirmDeleteFile($event)"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-container>

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
      :recipe-id="props.recipe.id"
      :recipe-title="props.recipe.title"
    />

    <VersionHistoryModal
      v-model="versionHistoryModalOpen"
      :recipe="props.recipe"
      :versions="versionsNewestFirst"
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
import type {
  CollectionMember,
  Recipe,
  RecipeFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { recipe_detail_content as strings } from "./RecipeDetailContent.strings.ts";
import { appLinks } from "@sderickson/recipes-links";
import { constructPath } from "@saflib/links";
import { useDetailFilesFlow } from "../../pages/recipes/detail/useDetailFilesFlow.ts";
import {
  RecipeContentPreview,
  useDeleteRecipeMutation,
} from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import VersionHistoryModal from "../../pages/recipes/detail/VersionHistoryModal.vue";
import ConfirmDialog from "../../pages/recipes/detail/ConfirmDialog.vue";
import UnsplashPickerDialog from "../../pages/recipes/detail/UnsplashPickerDialog.vue";

export interface RecipeDetailContentProps {
  recipe: Recipe;
  currentVersion: RecipeVersion | null;
  collectionId: string;
  members: CollectionMember[];
  userEmail: string;
  versions: RecipeVersion[];
  files: RecipeFileInfo[];
}

const props = defineProps<RecipeDetailContentProps>();

const { t, lookupTKey } = useReverseT();
const router = useRouter();

const showEdit = computed(() => {
  const currentMember = props.members.find((m) => m.email === props.userEmail);
  return currentMember?.role === "editor" || currentMember?.role === "owner";
});
const showVersionHistory = true;
const showFilesEdit = computed(() => showEdit.value);

const recipeEditPath = computed(() =>
  constructPath(appLinks.recipesEdit, {
    params: { collectionId: props.collectionId, id: props.recipe.id },
  }),
);

const filesFlow = useDetailFilesFlow(computed(() => props.recipe.id));
const deleteRecipeMutation = useDeleteRecipeMutation();

const versionHistoryModalOpen = ref(false);
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

const versionsNewestFirst = computed(() => [...props.versions].reverse());

const deleteFileDialogOpen = filesFlow.deleteFileDialogOpen;

function setDeleteFileDialogOpen(v: boolean) {
  deleteFileDialogOpen.value = v;
}

async function doDeleteRecipe() {
  await deleteRecipeMutation.mutateAsync(props.recipe.id);
  deleteRecipeDialogOpen.value = false;
  await router.push(
    constructPath(appLinks.collectionsDetail, {
      params: { collectionId: props.collectionId },
    }),
  );
}

watch(
  () => filesFlow.uploadFileMutation.isPending.value,
  (pending, wasPending) => {
    if (wasPending && !pending && imageFileInputRef.value) {
      imageFileInputRef.value.value = "";
    }
  },
);
</script>
