import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

/** POST /menus. Body: collectionId, name, isPublic, groupings. Response: { menu: Menu }. */
export const useCreateMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RecipesServiceRequestBody["createMenu"]) => {
      return handleClientMethod(getClient().POST("/menus", { body }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};
