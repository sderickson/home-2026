import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod, SILENCE_ERROR_SNACKBAR } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

/** Pass `silenceErrorSnackbar` when the caller renders the error inline. */
export const useCreateCollectionsMutation = (
  options: { silenceErrorSnackbar?: boolean } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { [SILENCE_ERROR_SNACKBAR]: options.silenceErrorSnackbar === true },
    mutationFn: async (
      body: RecipesServiceRequestBody["createCollections"],
    ) => {
      return handleClientMethod(getClient().POST("/collections", { body }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};
