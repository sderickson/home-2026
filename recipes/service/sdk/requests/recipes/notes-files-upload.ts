import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

export type NotesFilesUploadRecipesVariables = {
  recipeId: string;
  noteId: string;
  file: File;
};

export const useNotesFilesUploadRecipesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipeId,
      noteId,
      file,
    }: NotesFilesUploadRecipesVariables) => {
      const formData = new FormData();
      formData.append("file", file);
      return handleClientMethod(
        getClient().POST("/recipes/{id}/notes/{noteId}/files", {
          params: { path: { id: recipeId, noteId } },
          body: formData as unknown as RecipesServiceRequestBody["notesFilesUploadRecipes"],
        }),
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recipes", variables.recipeId, "notes", variables.noteId, "files"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recipes", variables.recipeId, "note-files"],
      });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
