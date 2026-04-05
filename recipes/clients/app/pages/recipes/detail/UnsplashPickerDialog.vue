<template>
  <v-dialog
    :model-value="modelValue"
    max-width="960"
    persistent
    transition="dialog-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="unsplash-picker__card d-flex flex-column">
      <v-card-title class="text-subtitle-1">
        {{ t(strings.title) }}
      </v-card-title>
      <v-card-text class="d-flex flex-column flex-grow-1 overflow-hidden pt-2">
        <v-text-field
          v-model="draftQuery"
          :label="t(strings.search_label)"
          :placeholder="t(strings.search_placeholder)"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-3"
          @keyup.enter="commitSearch"
        >
          <template #append-inner>
            <v-btn
              icon="mdi-magnify"
              variant="text"
              density="comfortable"
              :aria-label="t(strings.search_button)"
              @click="commitSearch"
            />
          </template>
        </v-text-field>
        <p
          v-if="activeQuery !== ''"
          class="text-body-2 text-medium-emphasis mb-3"
        >
          <i18n-t scope="global" :keypath="lookupTKey(strings.search_hint)">
            <template #query>{{ activeQuery }}</template>
          </i18n-t>
        </p>
        <div v-if="activeQuery === ''" class="text-body-2 text-medium-emphasis">
          {{ t(strings.no_query) }}
        </div>
        <template v-else>
          <div
            v-if="searchQueryResult.isPending.value"
            class="d-flex justify-center py-6"
          >
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div
            v-else-if="searchQueryResult.isError.value"
            class="text-body-2 text-error py-2"
          >
            {{ t(strings.search_error) }}
          </div>
          <div
            v-else-if="photos.length === 0"
            class="text-body-2 text-medium-emphasis py-2"
          >
            {{ t(strings.no_results) }}
          </div>
          <div v-else class="unsplash-picker__grid flex-grow-1 overflow-y-auto">
            <v-row dense>
              <v-col
                v-for="photo in photos"
                :key="photo.id"
                cols="auto"
                class="pa-1"
              >
                <div
                  class="unsplash-picker__thumb rounded-lg overflow-hidden position-relative"
                  :class="{
                    'unsplash-picker__thumb--selected':
                      selectedPhoto?.id === photo.id,
                  }"
                  @click="selectedPhoto = photo"
                >
                  <v-img
                    :src="photo.regularUrl"
                    :alt="''"
                    aspect-ratio="1"
                    cover
                    class="unsplash-picker__img cursor-pointer"
                  />
                  <div
                    v-if="selectedPhoto?.id === photo.id"
                    class="unsplash-picker__check position-absolute d-flex align-center justify-center"
                  >
                    <v-icon color="white" size="small">mdi-check-circle</v-icon>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          {{ t(strings.cancel) }}
        </v-btn>
        <v-btn
          color="primary"
          :loading="addFromUnsplashMutation.isPending.value"
          :disabled="!selectedPhoto"
          @click="addSelectedPhoto"
        >
          {{ t(strings.add_photo) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { UnsplashPhotoSearchItem } from "@sderickson/recipes-spec";
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import {
  searchUnsplashPhotosQuery,
  useFilesFromUnsplashRecipesMutation,
} from "@sderickson/recipes-sdk";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { unsplash_picker_dialog as strings } from "./UnsplashPickerDialog.strings.ts";

const props = defineProps<{
  modelValue: boolean;
  recipeId: string;
  recipeTitle: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  added: [];
}>();

const { t, lookupTKey } = useReverseT();

const draftQuery = ref("");
const activeQuery = ref("");

const searchQueryOptions = computed(() => ({
  ...searchUnsplashPhotosQuery({ q: activeQuery.value, perPage: 12 }),
  enabled: props.modelValue && activeQuery.value.length > 0,
}));

const searchQueryResult = useQuery(searchQueryOptions);

const photos = computed(
  () => searchQueryResult.data.value?.unsplashPhotos ?? [],
);

const selectedPhoto = ref<UnsplashPhotoSearchItem | null>(null);

const addFromUnsplashMutation = useFilesFromUnsplashRecipesMutation();

function syncSearchFromRecipe() {
  const q = (props.recipeTitle ?? "").trim();
  draftQuery.value = q;
  activeQuery.value = q;
}

function commitSearch() {
  activeQuery.value = draftQuery.value.trim();
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) syncSearchFromRecipe();
    selectedPhoto.value = null;
  },
);

async function addSelectedPhoto() {
  const photo = selectedPhoto.value;
  if (!photo || !props.recipeId) return;
  try {
    await addFromUnsplashMutation.mutateAsync({
      recipeId: props.recipeId,
      unsplashPhotoId: photo.id,
      downloadLocation: photo.downloadLocation,
      imageUrl: photo.regularUrl,
    });
    emit("update:modelValue", false);
    emit("added");
  } catch {
    // Error surfaced via mutation state / global error handling if needed
  }
}
</script>

<style scoped>
.unsplash-picker__card {
  max-height: 90vh;
  min-height: 480px;
}

.unsplash-picker__grid {
  min-height: 0;
  max-height: min(60vh, 640px);
}

.unsplash-picker__thumb {
  width: 200px;
  max-width: 100%;
  border: 3px solid transparent;
  cursor: pointer;
}

.unsplash-picker__img {
  width: 100%;
}

.unsplash-picker__thumb--selected {
  border-color: rgb(var(--v-theme-primary));
}

.unsplash-picker__check {
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
