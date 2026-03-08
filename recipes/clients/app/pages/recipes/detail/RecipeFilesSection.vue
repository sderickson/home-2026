<template>
  <div>
    <h2 class="text-h6 mb-2">{{ t(strings.title) }}</h2>
    <template v-if="showFilesEdit">
      <v-card variant="outlined" class="mb-3">
        <v-card-text>
          <input
            :ref="(el) => { filesFlow.fileInputRef.value = el as HTMLInputElement | null; }"
            type="file"
            class="d-none"
            @change="filesFlow.onFileInputChange"
          />
          <v-btn
            variant="outlined"
            prepend-icon="mdi-paperclip"
            class="mb-2"
            @click="filesFlow.triggerFileInputClick"
          >
            {{ t(strings.choose_file) }}
          </v-btn>
          <div v-if="filesFlow.selectedFile?.value" class="d-flex align-center gap-2 mb-2">
            <span class="text-body-2">{{ filesFlow.selectedFile.value.name }}</span>
            <v-btn
              color="primary"
              size="small"
              :loading="filesFlow.uploadFileMutation.isPending.value"
              @click="filesFlow.submitUploadFile()"
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
              :disabled="filesFlow.deleteFileMutation.isPending.value"
              @click="filesFlow.confirmDeleteFile(file)"
            >
              {{ t(strings.delete_file) }}
            </v-btn>
          </template>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { recipe_files_section as strings } from "./RecipeFilesSection.strings.ts";

defineProps<{
  files: RecipeFileInfo[];
  showFilesEdit: boolean;
  filesFlow: {
    fileInputRef: { value: HTMLInputElement | null };
    selectedFile: { value: File | null };
    uploadFileMutation: { isPending: { value: boolean } };
    deleteFileMutation: { isPending: { value: boolean } };
    triggerFileInputClick: () => void;
    onFileInputChange: (event: Event) => void;
    submitUploadFile: () => void;
    confirmDeleteFile: (file: RecipeFileInfo) => void;
  };
}>();

const { t } = useReverseT();
</script>
