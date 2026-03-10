<template>
  <div class="add-note-composer d-flex align-end gap-2">
    <v-textarea
      v-model="newNoteBodyModel"
      :placeholder="t(strings.note_body_placeholder)"
      rows="1"
      auto-grow
      variant="outlined"
      density="compact"
      hide-details
      class="add-note-composer__input flex-grow-1"
      @keydown.ctrl.enter="notesFlow.submitNewNote()"
    />
    <v-btn
      icon
      color="primary"
      size="small"
      class="add-note-composer__send flex-shrink-0"
      :loading="notesFlow.createMutation.isPending.value"
      :disabled="!trimmedBody"
      :aria-label="t(strings.create_note)"
      @click="notesFlow.submitNewNote()"
    >
      <v-icon>mdi-send</v-icon>
    </v-btn>
  </div>
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

const newNoteBodyModel = computed({
  get: () => notesFlow.newNoteBody.value,
  set: (v: string) => {
    notesFlow.newNoteBody.value = v;
  },
});

const { t } = useReverseT();

const trimmedBody = computed(() => notesFlow.newNoteBody.value.trim());
</script>

<style scoped>
.add-note-composer__input :deep(.v-field__input) {
  min-height: 40px;
}
</style>
