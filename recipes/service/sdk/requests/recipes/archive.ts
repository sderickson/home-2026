import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** Archive (or restore) a recipe. Archiving also removes it from menus. */
export const useArchiveRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      return handleClientMethod(
        getClient().PUT("/recipes/{id}/archive", {
          params: { path: { id } },
          body: { archived },
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};
