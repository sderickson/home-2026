import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** List recipes in a collection. GET /recipes?collectionId=... Auth required. */
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
