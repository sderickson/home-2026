import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import type { ComputedRef } from "vue";
import { ref } from "vue";
import {
  useFilesDeleteRecipesMutation,
  useFilesUploadRecipesMutation,
} from "@sderickson/recipes-sdk";

/**
 * Stateful flow for recipe files on the recipe detail page: upload and delete
 * with file selection state and mutations. The component binds fileInputRef to
 * the file input and uses the returned refs and handlers in the template.
 */
export function useDetailFilesFlow(recipeId: ComputedRef<string>) {
  const uploadFileMutation = useFilesUploadRecipesMutation();
  const deleteFileMutation = useFilesDeleteRecipesMutation();

  const fileInputRef = ref<HTMLInputElement | null>(null);
  const selectedFile = ref<File | null>(null);
  const fileToDelete = ref<{ recipeId: string; fileId: string } | null>(null);
  const deleteFileDialogOpen = ref(false);

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
    const id = recipeId.value;
    if (!file || !id) return;
    await uploadFileMutation.mutateAsync({ recipeId: id, file });
    selectedFile.value = null;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }

  function confirmDeleteFile(file: Pick<RecipeFileInfo, "id" | "recipeId">) {
    fileToDelete.value = { recipeId: file.recipeId, fileId: file.id };
    deleteFileDialogOpen.value = true;
  }

  async function doDeleteFile() {
    if (!fileToDelete.value) return;
    await deleteFileMutation.mutateAsync(fileToDelete.value);
    fileToDelete.value = null;
    deleteFileDialogOpen.value = false;
  }

  return {
    fileInputRef,
    selectedFile,
    fileToDelete,
    deleteFileDialogOpen,
    uploadFileMutation,
    deleteFileMutation,
    triggerFileInputClick,
    onFileInputChange,
    submitUploadFile,
    confirmDeleteFile,
    doDeleteFile,
  };
}
