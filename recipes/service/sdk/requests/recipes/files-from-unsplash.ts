import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

export type FilesFromUnsplashRecipesVariables = {
  recipeId: string;
} & RecipesServiceRequestBody["filesFromUnsplashRecipes"];

export const useFilesFromUnsplashRecipesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipeId,
      unsplashPhotoId,
      downloadLocation,
      imageUrl,
    }: FilesFromUnsplashRecipesVariables) => {
      return handleClientMethod(
        getClient().POST("/recipes/{id}/files/from-unsplash", {
          params: { path: { id: recipeId } },
          body: { unsplashPhotoId, downloadLocation, imageUrl },
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
