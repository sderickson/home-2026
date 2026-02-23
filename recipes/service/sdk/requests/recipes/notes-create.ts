import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type NotesCreateRecipesVariables = {
  id: string;
} & RecipesServiceRequestBody["notesCreateRecipes"];

export const useNotesCreateRecipesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: NotesCreateRecipesVariables) => {
      return handleClientMethod(
        getClient().POST("/recipes/{id}/notes", {
          params: { path: { id } },
          body,
        }),
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recipes", variables.id, "notes"] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
