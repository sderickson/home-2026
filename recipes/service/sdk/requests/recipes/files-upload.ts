import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

export type FilesUploadRecipesVariables = {
  recipeId: string;
  file: File;
};

export const useFilesUploadRecipesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipeId,
      file,
    }: FilesUploadRecipesVariables) => {
      const formData = new FormData();
      formData.append("file", file);
      return handleClientMethod(
        getClient().POST("/recipes/{id}/files", {
          params: { path: { id: recipeId } },
          body: formData as unknown as RecipesServiceRequestBody["filesUploadRecipes"],
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
