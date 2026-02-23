import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type NotesUpdateRecipesVariables = {
  id: string;
  noteId: string;
} & RecipesServiceRequestBody["notesUpdateRecipes"];

export const useNotesUpdateRecipesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      noteId,
      ...body
    }: NotesUpdateRecipesVariables) => {
      return handleClientMethod(
        getClient().PUT("/recipes/{id}/notes/{noteId}", {
          params: { path: { id, noteId } },
          body,
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
