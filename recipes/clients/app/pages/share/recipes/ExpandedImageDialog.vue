<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="90vw"
    max-height="90vh"
    transition="dialog-transition"
    @click:outside="file = null"
  >
    <v-card v-if="file" variant="flat" class="overflow-hidden">
      <v-img
        :src="file.downloadUrl"
        :alt="file.fileOriginalName"
        max-height="calc(90vh - 120px)"
        contain
      />
      <v-card-text
        v-if="file.unsplashAttribution"
        class="text-caption text-medium-emphasis py-2 px-3"
      >
        <i18n-t
          scope="global"
          :keypath="lookupTKey(strings.unsplash_photo_by)"
        >
          <template #name>
            <a
              :href="file.unsplashAttribution.photographerProfileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary text-decoration-none"
            >
              {{ file.unsplashAttribution.photographerName }}
            </a>
          </template>
        </i18n-t>
        <a
          :href="file.unsplashAttribution.unsplashSourceUrl"
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
            @click="step(-1)"
          />
          <span class="font-mono text-muted">
            {{ expandedImageIndex + 1 }} / {{ imageFiles.length }}
          </span>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            :aria-label="t(strings.next_image)"
            @click="step(1)"
          />
          <v-spacer />
        </template>
        <v-btn variant="text" @click="file = null">
          {{ t(strings.close) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import { computed } from "vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import {
  filterImageFiles,
  stepImageFile,
} from "./ExpandedImageDialog.logic.ts";
import { expanded_image_dialog as strings } from "./ExpandedImageDialog.strings.ts";

const props = defineProps<{
  files: RecipeFileInfo[];
}>();

const file = defineModel<RecipeFileInfo | null>({ required: true });

const { t, lookupTKey } = useReverseT();

const dialogOpen = computed({
  get: () => file.value != null,
  set: (v) => {
    if (!v) file.value = null;
  },
});

const imageFiles = computed(() => filterImageFiles(props.files));

const expandedImageIndex = computed(() =>
  imageFiles.value.findIndex((f) => f.id === file.value?.id),
);

function step(delta: number) {
  file.value = stepImageFile(imageFiles.value, file.value?.id, delta);
}
</script>
