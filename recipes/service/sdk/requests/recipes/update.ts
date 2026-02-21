import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type UpdateRecipeVariables = {
  id: string;
} & RecipesServiceRequestBody["updateRecipe"];

export const useUpdateRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateRecipeVariables) => {
      return handleClientMethod(
        getClient().PUT("/recipes/{id}", {
          params: { path: { id } },
          body,
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
