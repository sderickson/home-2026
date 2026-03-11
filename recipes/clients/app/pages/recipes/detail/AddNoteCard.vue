<template>
  <div class="add-note-composer-wrapper">
    <div class="add-note-composer">
      <v-textarea
        v-model="newNoteBodyModel"
        :placeholder="t(strings.note_body_placeholder)"
        rows="4"
        variant="plain"
        density="compact"
        hide-details
        class="add-note-composer__input"
        @keydown.shift.enter.prevent="onShiftEnter"
      />
      <v-btn
        icon
        color="primary"
        size="small"
        class="add-note-composer__send"
        :loading="notesFlow.createMutation.isPending.value"
        :disabled="!trimmedBody"
        :aria-label="t(strings.create_note)"
        @click="notesFlow.submitNewNote()"
      >
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </div>
    <div class="add-note-composer__hint text-caption text-medium-emphasis mt-1">
      <kbd class="add-note-composer__kbd">Shift+Enter</kbd>
      <span class="ml-1">{{ t(strings.to_send) }}</span>
    </div>
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

function onShiftEnter() {
  if (trimmedBody.value) notesFlow.submitNewNote();
}
</script>

<style scoped>
.add-note-composer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  background: rgb(var(--v-theme-surface));
}
.add-note-composer__input {
  flex: 1;
  min-width: 0;
}
.add-note-composer__input :deep(.v-field) {
  box-shadow: none;
  padding-inline-end: 0;
  min-height: 100px;
  align-items: flex-start;
}
.add-note-composer__input :deep(.v-field__input) {
  min-height: 100px;
  flex: 1 1 auto;
}
.add-note-composer__input :deep(textarea) {
  min-height: 100px !important;
  resize: none;
}
.add-note-composer__send {
  flex-shrink: 0;
  align-self: center;
}
.add-note-composer__kbd {
  padding: 2px 6px;
  font-size: 0.75rem;
  font-family: inherit;
  border-radius: 4px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
