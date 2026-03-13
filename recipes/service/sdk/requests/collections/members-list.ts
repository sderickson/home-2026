import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const membersListCollectionsQuery = (id: string) => {
  return queryOptions({
    queryKey: ["collections", id, "members"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/collections/{id}/members", {
          params: { path: { id } },
        }),
      ),
  });
};
