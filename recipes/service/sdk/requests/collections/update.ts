import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type UpdateCollectionVariables = {
  id: string;
} & RecipesServiceRequestBody["updateCollections"];

export const useUpdateCollectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateCollectionVariables) => {
      return handleClientMethod(
        getClient().PUT("/collections/{id}", {
          params: { path: { id } },
          body,
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};
