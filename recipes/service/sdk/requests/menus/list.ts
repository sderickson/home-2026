import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** Collection-scoped list: GET /menus?collectionId=... Response: { menus: Menu[] }. */
export const listMenusQuery = (collectionId: string) => {
  return queryOptions({
    queryKey: ["menus", "list", collectionId],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/menus", {
          params: { query: { collectionId } },
        }),
      ),
  });
};
