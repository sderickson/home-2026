<template>
  <div>
    <v-divider class="my-4" />
    <h2 class="text-h6 mb-2">{{ t(strings.files_section) }}</h2>
    <template v-if="files.length === 0">
      <p class="text-medium-emphasis">{{ t(strings.no_files) }}</p>
    </template>
    <template v-else>
      <v-card
        v-for="file in files"
        :key="file.id"
        variant="outlined"
        class="mb-3"
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
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { recipe_files_display as strings } from "./RecipeFilesDisplay.strings.ts";
import { useReverseT } from "@sderickson/recipes-root-spa/i18n";

export interface RecipeFileDisplayItem {
  id: string;
  fileOriginalName: string;
  downloadUrl?: string;
}

defineProps<{
  files: RecipeFileDisplayItem[];
}>();

const { t } = useReverseT();
</script>
