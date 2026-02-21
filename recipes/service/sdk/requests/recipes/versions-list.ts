import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const listRecipeVersionsQuery = (id: string) => {
  return queryOptions({
    queryKey: ["recipes", "versions-list", id],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}/versions", {
          params: { path: { id } },
        }),
      ),
  });
};
