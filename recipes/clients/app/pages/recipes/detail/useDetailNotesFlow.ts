import type { RecipeNote } from "@sderickson/recipes-spec";
import type { ComputedRef } from "vue";
import { ref } from "vue";
import {
  useNotesCreateRecipesMutation,
  useNotesDeleteRecipesMutation,
  useNotesUpdateRecipesMutation,
} from "@sderickson/recipes-sdk";

/**
 * Stateful flow for notes on the recipe detail page: add, edit, and delete notes
 * with form state and mutations. The component binds to the returned refs and
 * calls the handlers from the template.
 */
export function useDetailNotesFlow(recipeId: ComputedRef<string>) {
  const createMutation = useNotesCreateRecipesMutation();
  const updateMutation = useNotesUpdateRecipesMutation();
  const deleteMutation = useNotesDeleteRecipesMutation();

  const newNoteBody = ref("");
  const newNoteVersionId = ref<string | null>(null);
  const editingNoteId = ref<string | null>(null);
  const editBody = ref("");
  const editVersionId = ref<string | null>(null);
  const noteToDelete = ref<RecipeNote | null>(null);
  const deleteDialogOpen = ref(false);
  const expandedNoteId = ref<string | null>(null);

  async function submitNewNote() {
    const body = newNoteBody.value.trim();
    if (!body) return;
    await createMutation.mutateAsync({
      id: recipeId.value,
      body,
      ...(newNoteVersionId.value && {
        recipeVersionId: newNoteVersionId.value,
      }),
    });
    newNoteBody.value = "";
    newNoteVersionId.value = null;
  }

  function startEditNote(note: RecipeNote) {
    editingNoteId.value = note.id;
    editBody.value = note.body;
    editVersionId.value = note.recipeVersionId ?? null;
  }

  async function saveEditNote(note: RecipeNote) {
    await updateMutation.mutateAsync({
      id: recipeId.value,
      noteId: note.id,
      body: editBody.value.trim(),
      recipeVersionId: editVersionId.value ?? null,
    });
    editingNoteId.value = null;
  }

  function confirmDeleteNote(note: RecipeNote) {
    noteToDelete.value = note;
    deleteDialogOpen.value = true;
  }

  async function doDeleteNote() {
    if (!noteToDelete.value) return;
    await deleteMutation.mutateAsync({
      id: recipeId.value,
      noteId: noteToDelete.value.id,
    });
    noteToDelete.value = null;
    deleteDialogOpen.value = false;
  }

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    newNoteBody,
    newNoteVersionId,
    editingNoteId,
    editBody,
    editVersionId,
    noteToDelete,
    deleteDialogOpen,
    expandedNoteId,
    submitNewNote,
    startEditNote,
    saveEditNote,
    confirmDeleteNote,
    doDeleteNote,
  };
}
