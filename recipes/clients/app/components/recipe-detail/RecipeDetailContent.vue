<template>
  <div>
    <v-card class="recipe-card paper">
      <RecipeContentPreview
        :recipe="props.recipe"
        :current-version="displayedVersion"
        :files="props.files"
        @click-image="expandedImageFile = $event"
      >
        <!-- Every recipe action lives in one overflow menu, so the header is
             only as tall as the title. Older versions are read-only: no menu. -->
        <template v-if="isViewingLatest" #tools>
          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="mdi-dots-vertical"
                variant="text"
                class="d-print-none"
                :aria-label="t(strings.recipe_actions)"
              />
            </template>
            <v-list density="comfortable">
              <v-list-item
                prepend-icon="mdi-link-variant"
                :title="t(strings.toolbar_get_share_link)"
                @click="copyShareLink"
              />
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
        </template>
        <template v-if="displayedVersion" #stamp>
          <v-btn
            v-if="versionsNewestFirst.length > 1"
            icon="mdi-chevron-left"
            variant="text"
            size="x-small"
            class="d-print-none"
            :disabled="!canStepOlder"
            :aria-label="t(strings.older_version)"
            @click="stepVersion(1)"
          />
          <span>
            {{
              t(strings.version_stamp, {
                date: formatVersionDate(displayedVersion.createdAt),
              })
            }}
          </span>
          <v-btn
            v-if="versionsNewestFirst.length > 1"
            icon="mdi-chevron-right"
            variant="text"
            size="x-small"
            class="d-print-none"
            :disabled="isViewingLatest"
            :aria-label="t(strings.newer_version)"
            @click="stepVersion(-1)"
          />
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
          max-height="calc(90vh - 120px)"
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
        <v-card-actions>
          <v-btn
            v-if="showFilesEdit"
            variant="text"
            color="error"
            prepend-icon="mdi-delete-outline"
            :disabled="filesFlow.deleteFileMutation.isPending.value"
            @click="removeExpandedImage"
          >
            {{ t(strings.remove_image) }}
          </v-btn>
          <v-spacer />
          <template v-if="imageFiles.length > 1">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              :aria-label="t(strings.previous_image)"
              @click="stepExpandedImage(-1)"
            />
            <span class="font-mono text-muted">
              {{ expandedImageIndex + 1 }} / {{ imageFiles.length }}
            </span>
            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              :aria-label="t(strings.next_image)"
              @click="stepExpandedImage(1)"
            />
            <v-spacer />
          </template>
          <v-btn variant="text" @click="expandedImageFile = null">
            {{ t(strings.close) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <UnsplashPickerDialog
      v-model="unsplashPickerOpen"
      :recipe-id="props.recipe.id"
      :recipe-title="props.recipe.title"
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
import { constructPath, linkToHrefWithHost } from "@saflib/links";
import { showInfo } from "@saflib/vue";
import { useDetailFilesFlow } from "../../pages/recipes/detail/useDetailFilesFlow.ts";
import {
  RecipeContentPreview,
  useDeleteRecipeMutation,
} from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { formatVersionDate } from "../../pages/recipes/detail/Detail.logic.ts";
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
const showFilesEdit = computed(() => showEdit.value);

const recipeEditPath = computed(() =>
  constructPath(appLinks.recipesEdit, {
    params: { collectionId: props.collectionId, id: props.recipe.id },
  }),
);

const filesFlow = useDetailFilesFlow(computed(() => props.recipe.id));
const deleteRecipeMutation = useDeleteRecipeMutation();

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

const imageFiles = computed(() =>
  props.files.filter((f) => (f.mimetype ?? "").startsWith("image/")),
);

const expandedImageIndex = computed(() =>
  imageFiles.value.findIndex((f) => f.id === expandedImageFile.value?.id),
);

/** Page through the recipe's images in the viewer (wraps around). */
function stepExpandedImage(delta: number) {
  const n = imageFiles.value.length;
  if (n === 0) return;
  expandedImageFile.value =
    imageFiles.value[(expandedImageIndex.value + delta + n) % n] ?? null;
}

const versionsNewestFirst = computed(() => [...props.versions].reverse());

/** Which version is shown: 0 is the latest, higher numbers are older. */
const versionIndex = ref(0);
const isViewingLatest = computed(() => versionIndex.value === 0);
const canStepOlder = computed(
  () => versionIndex.value < versionsNewestFirst.value.length - 1,
);
const displayedVersion = computed(() =>
  isViewingLatest.value
    ? props.currentVersion
    : (versionsNewestFirst.value[versionIndex.value] ?? props.currentVersion),
);

/** +1 steps to an older version, -1 to a newer one. */
function stepVersion(delta: number) {
  const max = versionsNewestFirst.value.length - 1;
  versionIndex.value = Math.min(max, Math.max(0, versionIndex.value + delta));
}

// Back to the latest whenever the recipe or its version list changes.
watch(
  () => [props.recipe.id, props.versions.length],
  () => {
    versionIndex.value = 0;
  },
);

const deleteFileDialogOpen = filesFlow.deleteFileDialogOpen;

function setDeleteFileDialogOpen(v: boolean) {
  deleteFileDialogOpen.value = v;
}

function removeExpandedImage() {
  const file = expandedImageFile.value;
  if (!file) return;
  expandedImageFile.value = null;
  filesFlow.confirmDeleteFile(file);
}

async function copyShareLink() {
  const href = linkToHrefWithHost(appLinks.shareRecipes, {
    params: { id: props.recipe.id },
  });
  await navigator.clipboard.writeText(href);
  showInfo(t(strings.link_copied));
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
.recipe-card {
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.05),
    0 24px 44px -30px rgba(40, 30, 10, 0.6);
}
</style>
