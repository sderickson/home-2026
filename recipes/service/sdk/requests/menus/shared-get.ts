import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** Load a menu for the public share page. GET /menus/{id}/shared. No auth. */
export const sharedGetMenusQuery = (id: string) => {
  return queryOptions({
    queryKey: ["menus", id, "shared"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/menus/{id}/shared", {
          params: { path: { id } },
        }),
      ),
  });
};
