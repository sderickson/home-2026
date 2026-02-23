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
 * When latestVersionId is provided, new notes are automatically associated with that version.
 */
export function useDetailNotesFlow(
  recipeId: ComputedRef<string>,
  latestVersionId?: ComputedRef<string | undefined>,
) {
  const createMutation = useNotesCreateRecipesMutation();
  const updateMutation = useNotesUpdateRecipesMutation();
  const deleteMutation = useNotesDeleteRecipesMutation();

  const newNoteBody = ref("");
  const editingNoteId = ref<string | null>(null);
  const editBody = ref("");
  const noteToDelete = ref<RecipeNote | null>(null);
  const deleteDialogOpen = ref(false);

  async function submitNewNote() {
    const body = newNoteBody.value.trim();
    if (!body) return;
    const versionId = latestVersionId?.value;
    await createMutation.mutateAsync({
      id: recipeId.value,
      body,
      ...(versionId && { recipeVersionId: versionId }),
    });
    newNoteBody.value = "";
  }

  function startEditNote(note: RecipeNote) {
    editingNoteId.value = note.id;
    editBody.value = note.body;
  }

  async function saveEditNote(note: RecipeNote) {
    await updateMutation.mutateAsync({
      id: recipeId.value,
      noteId: note.id,
      body: editBody.value.trim(),
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
    editingNoteId,
    editBody,
    noteToDelete,
    deleteDialogOpen,
    submitNewNote,
    startEditNote,
    saveEditNote,
    confirmDeleteNote,
    doDeleteNote,
  };
}
