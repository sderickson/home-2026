import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

export const useCreateCollectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: RecipesServiceRequestBody["createCollections"],
    ) => {
      return handleClientMethod(
        getClient().POST("/collections", { body }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};
