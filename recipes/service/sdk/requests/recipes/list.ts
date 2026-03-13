import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const listRecipesQuery = (collectionId: string) => {
  return queryOptions({
    queryKey: ["recipes", "list", collectionId],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes", {
          params: { query: { collectionId } },
        }),
      ),
  });
};
