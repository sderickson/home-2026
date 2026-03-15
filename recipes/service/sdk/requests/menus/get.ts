import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** GET /menus/:id with collectionId query param. Response: { menu: Menu, recipes: Recipe[] }. Auth required. */
export const getMenuQuery = (id: string, collectionId: string) => {
  return queryOptions({
    queryKey: ["menus", id, collectionId],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/menus/{id}", {
          params: { path: { id }, query: { collectionId } },
        }),
      ),
  });
};
