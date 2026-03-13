import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const getCollectionsQuery = (id: string) => {
  return queryOptions({
    queryKey: ["collections", id],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/collections/{id}", {
          params: { path: { id } },
        }),
      ),
  });
};
