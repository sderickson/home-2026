<template>
  <div>
    <!-- Phone: back to the collection (or menu) and the recipe actions -->
    <div class="recipe-phone-bar d-flex d-md-none align-center">
      <v-btn
        :to="backTo"
        icon="mdi-chevron-left"
        variant="text"
        :aria-label="t(strings.back_to, { name: backLabel })"
      />
      <span class="flex-grow-1 font-mono text-muted text-truncate">
        {{ backLabel }}
      </span>
      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon="mdi-dots-vertical"
            variant="text"
            :aria-label="t(strings.recipe_actions)"
          />
        </template>
        <v-list density="comfortable">
          <v-list-item
            v-if="showVersionHistory"
            prepend-icon="mdi-history"
            :title="t(strings.toolbar_version_history)"
            @click="versionHistoryModalOpen = true"
          >
            <template v-if="props.versions.length > 0" #append>
              <v-badge
                :content="props.versions.length"
                color="primary"
                inline
              />
            </template>
          </v-list-item>
          <v-list-item
            v-if="showEdit"
            prepend-icon="mdi-pencil"
            :title="t(strings.toolbar_edit)"
            :to="recipeEditPath"
          />
          <template v-if="showFilesEdit">
            <v-list-item
              prepend-icon="mdi-upload"
              :title="t(strings.toolbar_upload_image)"
              :disabled="filesFlow.uploadFileMutation.isPending.value"
              @click="imageFileInputRef?.click()"
            />
            <v-list-item
              prepend-icon="mdi-image-search"
              :title="t(strings.toolbar_choose_unsplash)"
              @click="unsplashPickerOpen = true"
            />
          </template>
          <v-list-item
            v-if="showEdit && showFilesEdit"
            prepend-icon="mdi-delete"
            base-color="error"
            :title="t(strings.toolbar_delete)"
            :disabled="deleteRecipeMutation.isPending.value"
            @click="deleteRecipeDialogOpen = true"
          />
        </v-list>
      </v-menu>
    </div>

    <v-card class="recipe-card paper">
      <RecipeContentPreview
        :recipe="props.recipe"
        :current-version="props.currentVersion"
        :files="props.files"
        :show-image-actions="showFilesEdit"
        :image-delete-disabled="filesFlow.deleteFileMutation.isPending.value"
        @click-image="expandedImageFile = $event"
        @delete-image="filesFlow.confirmDeleteFile($event)"
      >
        <!-- Desktop: icon buttons in the card's top-right corner -->
        <template #tools>
          <div class="d-none d-md-flex">
            <v-tooltip
              v-if="showVersionHistory"
              location="bottom"
              :text="t(strings.toolbar_version_history)"
            >
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon
                  variant="text"
                  :aria-label="t(strings.toolbar_version_history)"
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
            <v-tooltip
              v-if="showEdit"
              location="bottom"
              :text="t(strings.toolbar_edit)"
            >
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon="mdi-pencil"
                  variant="text"
                  :aria-label="t(strings.toolbar_edit)"
                  :to="recipeEditPath"
                />
              </template>
            </v-tooltip>
            <v-tooltip
              v-if="showFilesEdit"
              location="bottom"
              :text="t(strings.toolbar_images)"
            >
              <template #activator="{ props: tooltipProps }">
                <v-menu location="bottom">
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="{ ...tooltipProps, ...menuProps }"
                      icon="mdi-image-plus"
                      variant="text"
                      :aria-label="t(strings.toolbar_images)"
                      :disabled="filesFlow.uploadFileMutation.isPending.value"
                    />
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
            <v-tooltip
              v-if="showEdit && showFilesEdit"
              location="bottom"
              :text="t(strings.toolbar_delete)"
            >
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  :aria-label="t(strings.toolbar_delete)"
                  :disabled="deleteRecipeMutation.isPending.value"
                  @click="deleteRecipeDialogOpen = true"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </RecipeContentPreview>
    </v-card>

    <input
      v-if="showFilesEdit"
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
  /** Phone back link: the collection, or the menu when reached from a menu. */
  backTo: string;
  backLabel: string;
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

<style scoped>
.recipe-phone-bar {
  height: 56px;
  margin: -16px -16px 12px;
  padding: 0 4px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline-soft));
}

.recipe-card {
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.05),
    0 24px 44px -30px rgba(40, 30, 10, 0.6);
}
</style>
