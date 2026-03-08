import type { RecipeNoteFileInfo } from "@sderickson/recipes-spec";
import type { ComputedRef } from "vue";
import { ref } from "vue";
import {
  useNotesFilesDeleteRecipesMutation,
  useNotesFilesUploadRecipesMutation,
} from "@sderickson/recipes-sdk";

/**
 * Stateful flow for note files on the recipe detail page: upload and delete
 * per note, with file selection state and mutations. Admin only. The component
 * uses setUploadTargetNote(noteId) before opening the file picker so the
 * upload is associated with the correct note.
 */
export function useDetailNoteFilesFlow(recipeId: ComputedRef<string>) {
  const uploadMutation = useNotesFilesUploadRecipesMutation();
  const deleteMutation = useNotesFilesDeleteRecipesMutation();

  const fileInputRef = ref<HTMLInputElement | null>(null);
  const selectedFile = ref<File | null>(null);
  const uploadTargetNoteId = ref<string | null>(null);
  const fileToDelete = ref<{
    recipeId: string;
    noteId: string;
    fileId: string;
  } | null>(null);
  const deleteNoteFileDialogOpen = ref(false);

  function setUploadTargetNote(noteId: string) {
    uploadTargetNoteId.value = noteId;
  }

  function triggerFileInputClick() {
    fileInputRef.value?.click();
  }

  function onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    selectedFile.value = file ?? null;
  }

  async function submitUploadFile() {
    const file = selectedFile.value;
    const noteId = uploadTargetNoteId.value;
    const id = recipeId.value;
    if (!file || !noteId || !id) return;
    await uploadMutation.mutateAsync({ recipeId: id, noteId, file });
    selectedFile.value = null;
    uploadTargetNoteId.value = null;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }

  function confirmDeleteFile(
    file: Pick<RecipeNoteFileInfo, "id" | "recipeNoteId">,
  ) {
    fileToDelete.value = {
      recipeId: recipeId.value,
      noteId: file.recipeNoteId,
      fileId: file.id,
    };
    deleteNoteFileDialogOpen.value = true;
  }

  async function doDeleteFile() {
    if (!fileToDelete.value) return;
    await deleteMutation.mutateAsync(fileToDelete.value);
    fileToDelete.value = null;
    deleteNoteFileDialogOpen.value = false;
  }

  return {
    fileInputRef,
    selectedFile,
    uploadTargetNoteId,
    fileToDelete,
    deleteNoteFileDialogOpen,
    uploadMutation,
    deleteMutation,
    setUploadTargetNote,
    triggerFileInputClick,
    onFileInputChange,
    submitUploadFile,
    confirmDeleteFile,
    doDeleteFile,
  };
}
