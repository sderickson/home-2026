<template>
  <div
    class="recipe-notes-panel-body d-flex flex-column flex-grow-1 min-height-0"
  >
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
          :recipe-id="recipeId"
          :latest-version-id="latestVersionId"
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
          :recipe-id="recipeId"
          :latest-version-id="latestVersionId"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { RecipeNote, RecipeNoteFileInfo } from "@sderickson/recipes-spec";
import { recipe_detail_content as strings } from "./RecipeDetailContent.strings.ts";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import AddNoteCard from "../../pages/recipes/detail/AddNoteCard.vue";
import NoteCard from "../../pages/recipes/detail/NoteCard.vue";

defineProps<{
  recipeId: string;
  latestVersionId?: string;
  notesForLatestVersion: RecipeNote[];
  notesTimelineOrder: RecipeNote[];
  showNotesEdit: boolean;
  getFilesForNote: (note: { id: string }) => RecipeNoteFileInfo[];
}>();

const { t } = useReverseT();
</script>
