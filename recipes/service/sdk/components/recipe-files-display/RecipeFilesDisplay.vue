<template>
  <div>
    <v-divider class="my-4" />
    <h2 class="text-h6 mb-2">{{ t(strings.files_section) }}</h2>
    <template v-if="files.length === 0">
      <p class="text-medium-emphasis">{{ t(strings.no_files) }}</p>
    </template>
    <template v-else>
      <v-carousel
        :cycle="false"
        height="320"
        hide-delimiters
        show-arrows="hover"
        class="rounded"
      >
        <v-carousel-item v-for="file in files" :key="file.id" :value="file.id">
          <template v-if="isImageFile(file)">
            <v-img
              v-if="file.downloadUrl"
              :src="file.downloadUrl"
              :alt="file.fileOriginalName"
              max-height="280"
              contain
              class="rounded"
            />
          </template>
          <template v-else>
            <v-card variant="outlined" class="pa-4 text-center">
              <v-icon size="48" class="mb-2">mdi-file-document-outline</v-icon>
              <a
                v-if="file.downloadUrl"
                :href="file.downloadUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-body-2 text-primary text-decoration-none d-block"
              >
                {{ file.fileOriginalName }}
              </a>
              <span v-else class="text-body-2">{{
                file.fileOriginalName
              }}</span>
            </v-card>
          </template>
        </v-carousel-item>
      </v-carousel>
    </template>
  </div>
</template>

<script setup lang="ts">
import { recipe_files_display_strings as strings } from "./RecipeFilesDisplay.strings.ts";
import { useReverseT } from "../../i18n.ts";

export interface RecipeFileDisplayItem {
  id: string;
  fileOriginalName: string;
  mimetype?: string;
  downloadUrl?: string;
}

defineProps<{
  files: RecipeFileDisplayItem[];
}>();

const { t } = useReverseT();
function isImageFile(file: RecipeFileDisplayItem): boolean {
  return (file.mimetype ?? "").startsWith("image/");
}
</script>
