import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const useMembersRemoveCollectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      memberId,
    }: { id: string; memberId: string }) => {
      return handleClientMethod(
        getClient().DELETE("/collections/{id}/members/{memberId}", {
          params: { path: { id, memberId } },
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};
