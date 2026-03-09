import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export type NotesFilesDeleteRecipesVariables = {
  recipeId: string;
  noteId: string;
  fileId: string;
};

export const useNotesFilesDeleteRecipesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipeId,
      noteId,
      fileId,
    }: NotesFilesDeleteRecipesVariables) => {
      return handleClientMethod(
        getClient().DELETE("/recipes/{id}/notes/{noteId}/files/{fileId}", {
          params: { path: { id: recipeId, noteId, fileId } },
        }),
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "recipes",
          variables.recipeId,
          "notes",
          variables.noteId,
          "files",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["recipes", variables.recipeId, "note-files"],
      });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
