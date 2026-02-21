import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

export const useCreateRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RecipesServiceRequestBody["createRecipe"]) => {
      return handleClientMethod(
        getClient().POST("/recipes", { body }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
