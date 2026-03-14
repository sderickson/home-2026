import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** DELETE /menus/:id. Pass collectionId as query param (optional, per API). Response: 204. */
export const useDeleteMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      collectionId,
    }: {
      id: string;
      collectionId?: string;
    }) => {
      return handleClientMethod(
        getClient().DELETE("/menus/{id}", {
          params: {
            path: { id },
            query: collectionId != null ? { collectionId } : {},
          },
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};
