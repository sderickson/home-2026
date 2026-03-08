<template>
  <v-card variant="outlined" class="mb-3">
    <v-card-title class="text-subtitle-1">
      {{ t(strings.title) }}
    </v-card-title>
    <v-card-text>
      <v-textarea
        v-model="notesFlow.newNoteBody"
        :placeholder="t(strings.note_body_placeholder)"
        rows="3"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-2"
      />
      <v-btn
        color="primary"
        :loading="notesFlow.createMutation.isPending.value"
        :disabled="!trimmedBody"
        @click="notesFlow.submitNewNote()"
      >
        {{ t(strings.create_note) }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useReverseT } from "@sderickson/recipes-app-spa/i18n";
import { add_note_card as strings } from "./AddNoteCard.strings.ts";
import { useDetailNotesFlow } from "./useDetailNotesFlow.ts";

const props = defineProps<{
  recipeId: string;
  latestVersionId: string | undefined;
}>();

const notesFlow = useDetailNotesFlow(
  computed(() => props.recipeId),
  computed(() => props.latestVersionId),
);

const { t } = useReverseT();

const trimmedBody = computed(() => notesFlow.newNoteBody.value.trim());
</script>
