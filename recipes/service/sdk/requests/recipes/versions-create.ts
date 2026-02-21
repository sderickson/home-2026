import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type CreateRecipeVersionVariables = {
  id: string;
} & RecipesServiceRequestBody["createRecipeVersion"];

export const useCreateRecipeVersionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: CreateRecipeVersionVariables) => {
      return handleClientMethod(
        getClient().POST("/recipes/{id}/versions", {
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
