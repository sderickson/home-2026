import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export type FilesDeleteRecipesVariables = {
  recipeId: string;
  fileId: string;
};

export const useFilesDeleteRecipesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipeId,
      fileId,
    }: FilesDeleteRecipesVariables) => {
      return handleClientMethod(
        getClient().DELETE("/recipes/{id}/files/{fileId}", {
          params: { path: { id: recipeId, fileId } },
        }),
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recipes", variables.recipeId, "files"],
      });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
