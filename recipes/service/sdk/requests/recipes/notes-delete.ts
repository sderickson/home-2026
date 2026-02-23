import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

type NotesDeleteRecipesVariables = {
  id: string;
  noteId: string;
};

export const useNotesDeleteRecipesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, noteId }: NotesDeleteRecipesVariables) => {
      return handleClientMethod(
        getClient().DELETE("/recipes/{id}/notes/{noteId}", {
          params: { path: { id, noteId } },
        }),
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recipes", variables.id, "notes"],
      });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
