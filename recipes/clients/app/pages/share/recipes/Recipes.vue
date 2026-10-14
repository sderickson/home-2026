<template>
  <v-container fluid class="pa-0 pt-md-4" max-width="1040">
    <v-card class="recipe-card paper">
      <RecipeContentPreview
        :recipe="recipe"
        :current-version="currentVersion"
        :files="files"
        @click-image="expandedImageFile = $event"
      />
    </v-card>

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
            {{ t(strings.unsplash_on_unsplash) }}
          </a>
        </v-card-text>
        <v-card-actions>
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
  </v-container>
</template>

<script setup lang="ts">
import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import { computed, ref } from "vue";
import { RecipeContentPreview } from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { useRecipesLoader } from "./Recipes.loader.ts";
import { assertSharedRecipeLoaded } from "./Recipes.logic.ts";
import { share_recipes as strings } from "./Recipes.strings.ts";

const { t, lookupTKey } = useReverseT();

const { sharedRecipeQuery } = useRecipesLoader();

assertSharedRecipeLoaded(sharedRecipeQuery.data.value);

const recipe = computed(() => sharedRecipeQuery.data.value!.recipe);
const currentVersion = computed(
  () => sharedRecipeQuery.data.value!.currentVersion,
);
const files = computed(() => sharedRecipeQuery.data.value!.files);

const expandedImageFile = ref<RecipeFileInfo | null>(null);

const expandedImageDialogOpen = computed({
  get: () => expandedImageFile.value != null,
  set: (v) => {
    if (!v) expandedImageFile.value = null;
  },
});

const imageFiles = computed(() =>
  files.value.filter((f) => (f.mimetype ?? "").startsWith("image/")),
);

const expandedImageIndex = computed(() =>
  imageFiles.value.findIndex((f) => f.id === expandedImageFile.value?.id),
);

function stepExpandedImage(delta: number) {
  const n = imageFiles.value.length;
  if (n === 0) return;
  expandedImageFile.value =
    imageFiles.value[(expandedImageIndex.value + delta + n) % n] ?? null;
}
</script>

<style scoped>
.recipe-card {
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.05),
    0 8px 24px rgba(0, 0, 0, 0.06);
}
</style>
