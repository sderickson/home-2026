import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type UpdateMenuVariables = {
  id: string;
} & RecipesServiceRequestBody["updateMenu"];

/** PUT /menus/:id. Body: collectionId, name, isPublic, groupings. Response: { menu: Menu }. */
export const useUpdateMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateMenuVariables) => {
      return handleClientMethod(
        getClient().PUT("/menus/{id}", {
          params: { path: { id } },
          body,
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};
