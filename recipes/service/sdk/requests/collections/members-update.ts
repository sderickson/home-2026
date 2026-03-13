import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type MembersUpdateCollectionsVariables = {
  id: string;
  memberId: string;
} & RecipesServiceRequestBody["membersUpdateCollections"];

export const useMembersUpdateCollectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      memberId,
      ...body
    }: MembersUpdateCollectionsVariables) => {
      return handleClientMethod(
        getClient().PUT("/collections/{id}/members/{memberId}", {
          params: { path: { id, memberId } },
          body,
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};
