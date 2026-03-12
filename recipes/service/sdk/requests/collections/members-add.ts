import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";
import type { RecipesServiceRequestBody } from "@sderickson/recipes-spec";

type MembersAddCollectionsVariables = {
  id: string;
} & RecipesServiceRequestBody["membersAddCollections"];

export const useMembersAddCollectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: MembersAddCollectionsVariables) => {
      return handleClientMethod(
        getClient().POST("/collections/{id}/members", {
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
