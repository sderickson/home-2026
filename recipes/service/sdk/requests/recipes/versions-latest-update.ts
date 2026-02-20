import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type UpdateRecipeVersionLatestVariables = {
  id: string;
} & RecipesServiceRequestBody["updateRecipeVersionLatest"];

export const useUpdateRecipeVersionLatestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateRecipeVersionLatestVariables) => {
      return handleClientMethod(
        getClient().PUT("/recipes/{id}/versions/latest", {
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
